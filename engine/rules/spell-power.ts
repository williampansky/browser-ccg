/**
 * Spell damage (RULES Q16, provisional). Which kinds of effect a spell's "+N Spell Damage" raises.
 * Changing the author's decision later is an edit to this table plus a test.
 * Never include draw counts, armor or summon stats.
 */
export const SPELL_POWER_APPLIES = { damage: true, heal: false } as const;

/** `amount` plus the caster's spell damage, if this effect kind is raised and a spell is being cast. */
export const withSpellPower = (kind: keyof typeof SPELL_POWER_APPLIES, amount: number, spellDamage = 0): number =>
  SPELL_POWER_APPLIES[kind] && amount > 0 ? amount + spellDamage : amount;
