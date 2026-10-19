// useForm — values, touched state, errors and submission in one hook.
//
// Pairs with lib/validate.js. A page describes its fields and its rules, and
// gets back everything a controlled form needs, including the server's own
// field errors merged in: when the API answers 400 with
// { errors: { email: '...' } } those land on the same fields as the local
// rules, so a duplicate email reads the same as an empty one.

import { useCallback, useMemo, useRef, useState } from 'react';
import { validateAll } from './validate';

export default function useForm(initial, schema, { onSubmit } = {}) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const firstBadRef = useRef(null);

  const localErrors = useMemo(() => validateAll(values, schema), [values, schema]);
  const errors = useMemo(() => ({ ...localErrors, ...serverErrors }), [localErrors, serverErrors]);
  const isValid = Object.keys(localErrors).length === 0;

  // A field is only "wrong" once the person has left it or tried to submit.
  const showError = useCallback(
    (field) => Boolean((touched[field] || submitted) && errors[field]),
    [touched, submitted, errors],
  );
  const errorFor = useCallback((field) => (showError(field) ? errors[field] : ''), [showError, errors]);

  const setField = useCallback((field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
    // A server complaint about this field is stale the moment it is edited.
    setServerErrors((s) => (s[field] ? { ...s, [field]: undefined } : s));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === 'checkbox' ? checked : value);
  }, [setField]);

  const handleBlur = useCallback((e) => {
    const name = e.target.name || e.target.getAttribute?.('data-field');
    if (name) setTouched((t) => ({ ...t, [name]: true }));
  }, []);

  // Everything a plain <input name="x"> needs, in one spread.
  const field = useCallback((name, extra = {}) => ({
    name,
    value: values[name] ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': showError(name) || undefined,
    'aria-describedby': showError(name) ? `${name}-error` : undefined,
    ...extra,
  }), [values, handleChange, handleBlur, showError]);

  const reset = useCallback((next = initial) => {
    setValues(next); setTouched({}); setServerErrors({});
    setSubmitted(false); setStatus({ type: '', message: '' });
  }, [initial]);

  const submit = useCallback(async (e) => {
    e?.preventDefault?.();
    setSubmitted(true);
    setStatus({ type: '', message: '' });

    const bad = validateAll(values, schema);
    if (Object.keys(bad).length) {
      // Put the cursor on the first problem rather than leaving somebody to
      // hunt for the red box on a long form.
      const first = Object.keys(bad)[0];
      const el = firstBadRef.current?.querySelector?.(`[name="${first}"], #${CSS.escape(first)}`);
      el?.focus?.();
      el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      setStatus({ type: 'error', message: 'Check the highlighted fields and try again.' });
      return { ok: false, errors: bad };
    }

    setBusy(true);
    try {
      const result = await onSubmit?.(values);
      setBusy(false);
      return { ok: true, result };
    } catch (err) {
      setBusy(false);
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === 'object') {
        setServerErrors(data.errors);
        setStatus({ type: 'error', message: data.message || 'Check the highlighted fields and try again.' });
      } else {
        setStatus({ type: 'error', message: data?.message || err?.message || 'Something went wrong. Try again.' });
      }
      return { ok: false, error: err };
    }
  }, [values, schema, onSubmit]);

  return {
    values, setValues, setField, errors, errorFor, showError,
    touched, setTouched, isValid, busy, status, setStatus,
    handleChange, handleBlur, field, submit, reset, formRef: firstBadRef,
  };
}
