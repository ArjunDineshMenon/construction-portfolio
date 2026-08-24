/* ==========================================================================
   Golden Pearl Trading & Contracting — enquiry capture
   --------------------------------------------------------------------------
   Handles two forms with one code path:
     #contact-form   the inline form on contact.html (plain HTML, always there)
     #inquiry-form   the modal form, injected below and opened by any element
                     with the class .open-inquiry-modal

   What changed from the previous version
   --------------------------------------
   1. The modal markup used to be injected *inside* the Supabase CDN script's
      onload callback. If cdn.jsdelivr.net was blocked or slow, the modal was
      never created and every "Inquire Now" button silently did nothing. The
      markup is now injected immediately and the SDK is loaded separately; if
      it never arrives, the form falls back to email and telephone.
   2. Added a phone field. A construction enquiry without a callback number is
      half an enquiry.
   3. Added a honeypot and a minimum fill time. The anon insert endpoint is
      public, and previously had no spam protection at all.
   4. Removed the unreachable "(Mock mode)" branch, the placeholder-URL guard
      that could never be false, and the stale "Replace with actual Supabase
      URL and Anon Key later" comment that sat directly above live credentials.
   5. Accessibility: role="dialog", aria-modal, labelled inputs (the old ones
      had unlinked <label> elements), Escape to close, focus trap, and focus
      restored to the trigger on close.

   On the credentials below: a Supabase anon key is designed to be public, so
   committing it is not a leak. It does mean all protection comes from Row
   Level Security. The `inquiries` table must allow INSERT for the anon role
   and nothing else — in particular it must not be SELECT-able, or anyone
   could read every enquiry you have ever received. See README.md.
   ========================================================================== */

(function () {
  'use strict';

  var SUPABASE_URL = 'https://rtjdqcztahwyivnyrwvp.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0amRxY3p0YWh3eWl2bnlyd3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTY2NTksImV4cCI6MjA5NTI5MjY1OX0.kx5qZJoi_4myOei_CyENVpj4znDLHaI5ubn2KawbWz8';

  /* The live `inquiries` table has columns Name / Email / Service / Message.
     Inserting a key that does not exist makes PostgREST reject the whole row,
     so while this is false the phone number is prepended to Message instead.

     After running the migration in README.md ("alter table inquiries add
     column phone text"), flip this to true. */
  var HAS_PHONE_COLUMN = false;

  var FALLBACK_EMAIL = 'info@goldenpearlbh.com';
  /* Printed as six digits in the company brochure; not dialable as-is,
     so the fallback offers email only. TODO(phone): add once confirmed. */
  var FALLBACK_TEL = '';

  var MIN_FILL_SECONDS = 3;

  var supabase = null;
  var sdkFailed = false;

  /* ------------------------------------------------------------------ SDK */

  function loadSupabase() {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;

    script.onload = function () {
      try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (error) {
        sdkFailed = true;
      }
    };

    script.onerror = function () { sdkFailed = true; };
    document.head.appendChild(script);
  }

  /* ---------------------------------------------------------------- Modal */

  var MODAL_HTML =
    '<div id="inquiry-modal" class="fixed inset-0 z-modal hidden items-center justify-center bg-black/70 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="inquiry-modal-title">' +
      '<div class="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-2 border border-gold-dark p-8">' +
        '<button id="close-inquiry" type="button" class="absolute top-4 right-4 text-ink hover:text-gold transition-colors p-1" aria-label="Close dialog">' +
          '<span class="material-symbols-outlined" aria-hidden="true">close</span>' +
        '</button>' +
        '<h2 id="inquiry-modal-title" class="font-display text-headline-md text-gold mb-2">Request a Quote</h2>' +
        '<p class="text-body-md text-ink-muted mb-7">Tell us about the project and we will come back to you.</p>' +
        '<form id="inquiry-form" novalidate>' +
          '<div class="space-y-4">' +
            '<div>' +
              '<label class="field-label" for="iq-name">Name *</label>' +
              '<input class="field" id="iq-name" name="name" type="text" autocomplete="name" required/>' +
            '</div>' +
            '<div>' +
              '<label class="field-label" for="iq-email">Email *</label>' +
              '<input class="field" id="iq-email" name="email" type="email" autocomplete="email" required/>' +
            '</div>' +
            '<div>' +
              '<label class="field-label" for="iq-phone">Phone *</label>' +
              '<input class="field" id="iq-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="+973" required/>' +
            '</div>' +
            '<div>' +
              '<label class="field-label" for="iq-service">Discipline</label>' +
              '<select class="field" id="iq-service" name="service">' +
                '<option value="Civil &amp; Industrial">Civil &amp; Industrial Construction</option>' +
                '<option value="MEP &amp; Fire Systems">MEP &amp; Fire Systems</option>' +
                '<option value="Interior Fit-Out">Interior Fit-Out</option>' +
                '<option value="Joinery &amp; Millwork">Joinery &amp; Millwork</option>' +
                '<option value="Landscaping">Landscaping &amp; External Works</option>' +
                '<option value="Design &amp; Drawings">Design &amp; Schematic Drawings</option>' +
                '<option value="Multiple / Not sure">Multiple / Not sure</option>' +
              '</select>' +
            '</div>' +
            '<div>' +
              '<label class="field-label" for="iq-message">Project details *</label>' +
              '<textarea class="field" id="iq-message" name="message" rows="4" required ' +
                'placeholder="Site location, scope, target completion date."></textarea>' +
            '</div>' +
            '<div class="hp-field" aria-hidden="true">' +
              '<label for="iq-company-url">Do not fill this in</label>' +
              '<input id="iq-company-url" name="company_url" type="text" tabindex="-1" autocomplete="off"/>' +
            '</div>' +
            '<div class="js-form-status text-body-sm" role="status" aria-live="polite" hidden></div>' +
            '<button class="btn w-full js-form-submit" type="submit">Send Enquiry</button>' +
          '</div>' +
        '</form>' +
      '</div>' +
    '</div>';

  function initModal() {
    var triggers = document.querySelectorAll('.open-inquiry-modal');
    if (!triggers.length) return;

    document.body.insertAdjacentHTML('beforeend', MODAL_HTML);

    var modal = document.getElementById('inquiry-modal');
    var closeBtn = document.getElementById('close-inquiry');
    var form = document.getElementById('inquiry-form');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.classList.add('drawer-open');
      var firstField = modal.querySelector('input, textarea, select');
      if (firstField) firstField.focus();
      document.addEventListener('keydown', onKeydown);
      form.dataset.openedAt = String(Date.now());
    }

    function close() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.classList.remove('drawer-open');
      document.removeEventListener('keydown', onKeydown);
      resetForm(form);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function onKeydown(event) {
      if (event.key === 'Escape') { close(); return; }
      if (event.key !== 'Tab') return;
      var items = modal.querySelectorAll('a[href], button:not([disabled]), input, select, textarea');
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }

    Array.prototype.forEach.call(triggers, function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        open();
      });
    });

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) close();
    });

    bindForm(form, close);
  }

  /* ----------------------------------------------------------------- Forms */

  function statusNode(form) { return form.querySelector('.js-form-status'); }
  function submitNode(form) { return form.querySelector('.js-form-submit'); }

  function setStatus(form, message, kind) {
    var node = statusNode(form);
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    node.classList.remove('text-error', 'text-success', 'text-ink-muted');
    node.classList.add(kind === 'error' ? 'text-error'
      : kind === 'success' ? 'text-success' : 'text-ink-muted');
  }

  function clearStatus(form) {
    var node = statusNode(form);
    if (!node) return;
    node.hidden = true;
    node.textContent = '';
  }

  function setBusy(form, busy) {
    var button = submitNode(form);
    if (!button) return;
    button.disabled = busy;
    button.textContent = busy ? 'Sending…' : 'Send Enquiry';
  }

  function resetForm(form) {
    form.reset();
    clearStatus(form);
    setBusy(form, false);
    delete form.dataset.openedAt;
    delete form.dataset.waited;
  }

  function fieldValue(form, name) {
    var node = form.elements[name];
    return node ? String(node.value || '').trim() : '';
  }

  /* Native validation is bypassed with novalidate so that the messages can be
     styled and announced consistently across both forms. */
  function validate(form) {
    var name = fieldValue(form, 'name');
    var email = fieldValue(form, 'email');
    var phone = fieldValue(form, 'phone');
    var message = fieldValue(form, 'message');

    if (name.length < 2) return { ok: false, error: 'Please enter your name.', focus: 'name' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: 'Please enter a valid email address.', focus: 'email' };
    if (phone.replace(/[^0-9]/g, '').length < 8) return { ok: false, error: 'Please enter a phone number we can call you back on.', focus: 'phone' };
    if (message.length < 10) return { ok: false, error: 'Please add a little detail about the project.', focus: 'message' };

    return {
      ok: true,
      payload: {
        name: name,
        email: email,
        phone: phone,
        service: fieldValue(form, 'service') || 'Not specified',
        message: message
      }
    };
  }

  function looksAutomated(form) {
    if (fieldValue(form, 'company_url')) return true;              // honeypot
    var openedAt = Number(form.dataset.openedAt || 0);
    if (!openedAt) return false;
    return (Date.now() - openedAt) < MIN_FILL_SECONDS * 1000;
  }

  function mailtoFallback(payload) {
    var body =
      'Name: ' + payload.name + '\n' +
      'Email: ' + payload.email + '\n' +
      'Phone: ' + payload.phone + '\n' +
      'Discipline: ' + payload.service + '\n\n' +
      payload.message;
    return 'mailto:' + FALLBACK_EMAIL +
      '?subject=' + encodeURIComponent('Project enquiry — ' + payload.service) +
      '&body=' + encodeURIComponent(body);
  }

  function offerFallback(form, payload) {
    var node = statusNode(form);
    if (!node) return;
    node.hidden = false;
    node.classList.remove('text-success');
    node.classList.add('text-error');
    var html =
      'We could not submit the form from your browser. ' +
      'Please <a class="text-gold underline" href="' + mailtoFallback(payload) + '">send it by email</a>';
    if (FALLBACK_TEL) {
      html += ' or call <a class="text-gold underline" href="tel:' +
        FALLBACK_TEL.replace(/\s/g, '') + '">' + FALLBACK_TEL + '</a>';
    }
    node.innerHTML = html + '.';
  }

  function buildRow(payload) {
    /* Column names are capitalised to match the existing table. */
    var row = {
      Name: payload.name,
      Email: payload.email,
      Service: payload.service,
      Message: payload.message
    };

    if (HAS_PHONE_COLUMN) {
      row.Phone = payload.phone;
    } else {
      row.Message = 'Phone: ' + payload.phone + '\n\n' + payload.message;
    }

    return row;
  }

  function bindForm(form, onSuccess) {
    if (!form || form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    // Timestamp for the minimum-fill-time check.
    if (!form.dataset.openedAt) form.dataset.openedAt = String(Date.now());

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      clearStatus(form);

      var result = validate(form);
      if (!result.ok) {
        setStatus(form, result.error, 'error');
        var target = form.elements[result.focus];
        if (target && target.focus) target.focus();
        return;
      }

      if (looksAutomated(form)) {
        // Report success rather than explaining the check to a bot.
        setStatus(form, 'Thank you — your enquiry has been received.', 'success');
        return;
      }

      setBusy(form, true);

      if (!supabase) {
        // Wait once for a slow SDK, then fall back. The `waited` flag stops
        // this from re-arming itself on the retry.
        if (sdkFailed || form.dataset.waited === 'true') {
          setBusy(form, false);
          offerFallback(form, result.payload);
          return;
        }
        form.dataset.waited = 'true';
        setStatus(form, 'Connecting…', 'info');
        window.setTimeout(function () {
          setBusy(form, false);
          if (supabase) {
            if (form.requestSubmit) form.requestSubmit();
            else form.dispatchEvent(new Event('submit'));
          } else {
            offerFallback(form, result.payload);
          }
        }, 2500);
        return;
      }

      supabase.from('inquiries').insert([buildRow(result.payload)])
        .then(function (response) {
          setBusy(form, false);
          if (response.error) throw response.error;
          setStatus(form, 'Thank you — your enquiry has been received. We will be in touch.', 'success');
          form.reset();
          form.dataset.openedAt = String(Date.now());
          if (typeof onSuccess === 'function') window.setTimeout(onSuccess, 2200);
        })
        .catch(function () {
          setBusy(form, false);
          offerFallback(form, result.payload);
        });
    });
  }

  /* ------------------------------------------------------------------ Init */

  function init() {
    loadSupabase();
    initModal();
    bindForm(document.getElementById('contact-form'));
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
