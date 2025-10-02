const PRICE = {
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID,
  GOLD: process.env.STRIPE_GOLD_PRICE_ID,
  TRUSTED_BADGE: process.env.STRIPE_TRUSTED_BADGE_PRICE_ID,
  UNDO_SWIPE: process.env.STRIPE_UNDO_SWIPE_PRICE_ID,
  INCOGNITO: process.env.STRIPE_INCOGNITO_PRICE_ID,
  SUPER_LIKE: process.env.STRIPE_SUPER_LIKE_PRICE_ID,
  ROSE_GIFT: process.env.STRIPE_ROSE_GIFT_PRICE_ID,
  DIAMOND_GIFT: process.env.STRIPE_DIAMOND_GIFT_PRICE_ID,
};

function mapPriceToAction(priceId) {
  switch (priceId) {
    case PRICE.PREMIUM:
      return { type: 'subscription', plan: 'PREMIUM' };
    case PRICE.GOLD:
      return { type: 'subscription', plan: 'GOLD' };
    case PRICE.TRUSTED_BADGE:
      return { type: 'one_time', action: 'trusted_badge' };
    case PRICE.UNDO_SWIPE:
      return { type: 'one_time', action: 'undo_swipe' };
    case PRICE.INCOGNITO:
      return { type: 'subscription', plan: 'PREMIUM', action: 'incognito' };
    case PRICE.ROSE_GIFT:
    case PRICE.DIAMOND_GIFT:
      return { type: 'one_time', action: 'gift' };
    default:
      return { type: 'unknown' };
  }
}

module.exports = { mapPriceToAction };
