import Link from 'next/link';
import React from 'react';

/**
 * The shared interface controls. Every screen that is meant to follow the interface theme builds its buttons, drop-downs, checkboxes
 * and switches from these, not from raw `<button>` / `<select>`, so a theme (styles/themes/_themes.scss) and any behaviour change
 * (focus, sounds, a11y) lands everywhere at once. The look lives in styles/site-styles/_ui-kit.scss.
 * Not for the cards, minions or heroes: those have their own look.
 */

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' };

/** A button. `type` defaults to "button" (never submits a form by accident). */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant, className, type = 'button', ...rest }, ref) => (
  <button ref={ref} type={type} className={cx('ui-btn', variant && `ui-btn--${variant}`, className)} {...rest} />
));
Button.displayName = 'Button';

/** A link that looks like a button (`href` is an internal route). */
export const LinkButton = ({ href, variant, className, children, ...rest }: { href: string; variant?: 'primary' | 'danger' } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) => (
  <Link href={href}>
    <a className={cx('ui-btn', variant && `ui-btn--${variant}`, className)} {...rest}>
      {children}
    </a>
  </Link>
);

/** A drop-down. Always pass `aria-label` (or wrap it in a label) so it has a name. */
export const Select = ({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) => <select className={cx('ui-field', className)} {...rest} />;

/** A text or search box. */
export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type = 'text', ...rest }, ref) => (
  <input ref={ref} type={type} className={cx('ui-field', className)} {...rest} />
));
TextInput.displayName = 'TextInput';

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'checked'> & {
  checked: boolean;
  /** Called with the new value. */
  onChange: (checked: boolean) => void;
  /** Goes on the label (the box is tiny, a hover title belongs on the whole thing). */
  title?: string;
};

/** A labelled checkbox: `<Checkbox checked onChange>Label</Checkbox>`. */
export const Checkbox = ({ checked, onChange, children, title, className, ...rest }: CheckboxProps) => (
  <label className={cx('ui-check', className)} title={title}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} {...rest} />
    <i aria-hidden="true" />
    {children !== undefined && <span>{children}</span>}
  </label>
);

/** A switch row: the label on the left, the switch on the right. */
export const Toggle = ({ label, checked, onChange, className }: { label: React.ReactNode; checked: boolean; onChange: (on: boolean) => void; className?: string }) => (
  <button type="button" role="switch" aria-checked={checked} className={cx('ui-toggle', className)} onClick={() => onChange(!checked)}>
    <span>{label}</span>
    <i aria-hidden="true" />
  </button>
);

export interface SegmentOption<T extends string | number | boolean> {
  value: T;
  label: React.ReactNode;
  title?: string;
  disabled?: boolean;
}

/**
 * A choice of one: a labelled segmented control (`label` shows on the left, e.g. Opponent) or, with `chips`, a row of small separate
 * buttons (mana cost, card size). Radio semantics either way.
 */
export function SegmentedControl<T extends string | number | boolean>({
  label,
  ariaLabel,
  options,
  value,
  onChange,
  chips,
  className,
}: {
  label?: string;
  ariaLabel?: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  chips?: boolean;
  className?: string;
}) {
  return (
    <div className={cx('ui-seg', chips && 'ui-seg--chips', className)} role="radiogroup" aria-label={ariaLabel ?? label}>
      {label && <span>{label}</span>}
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} title={o.title} disabled={o.disabled} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A titled box (menus, dialogs). Layout (width, padding, gap) comes from `className`; the look from the theme. */
export const Panel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...rest }, ref) => (
  <div ref={ref} className={cx('ui-panel', className)} {...rest} />
));
Panel.displayName = 'Panel';

/** A quieter box inside a panel (a settings group). */
export const Group = ({ className, ...rest }: React.HTMLAttributes<HTMLElement>) => <section className={cx('ui-group', className)} {...rest} />;
