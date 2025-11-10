// Tracking utilities para Facebook Pixel e Google Analytics (via GTM)

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface TrackingProduct {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  brand?: string;
}

// Declarar tipos globais para fbq e dataLayer
declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: any) => void;
    dataLayer?: any[];
  }
}

/**
 * Dispara evento de visualização de produto
 */
export const trackViewContent = (product: TrackingProduct) => {
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      value: product.price,
      currency: 'BRL'
    });
    console.log('📊 FB Pixel: ViewContent', product);
  }

  // Google Analytics via GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          item_category: product.category,
          item_brand: product.brand || 'Green Rush',
          quantity: 1
        }]
      }
    });
    console.log('📊 GTM: view_item', product);
  }
};

/**
 * Dispara evento de adicionar ao carrinho
 */
export const trackAddToCart = (items: CartItem[]) => {
  const value = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: items.map(item => item.id),
      content_type: 'product',
      value: value,
      currency: 'BRL',
      contents: items.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
    });
    console.log('📊 FB Pixel: AddToCart', { value, items: items.length });
  }

  // Google Analytics via GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        value: value,
        currency: 'BRL',
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category,
          quantity: item.quantity
        }))
      }
    });
    console.log('📊 GTM: add_to_cart', { value, items: items.length });
  }
};

/**
 * Dispara evento de iniciar checkout
 */
export const trackInitiateCheckout = (items: CartItem[], value: number) => {
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map(item => item.id),
      content_type: 'product',
      value: value,
      currency: 'BRL',
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      contents: items.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
    });
    console.log('📊 FB Pixel: InitiateCheckout', { value, items: items.length });
  }

  // Google Analytics via GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        value: value,
        currency: 'BRL',
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category,
          quantity: item.quantity
        }))
      }
    });
    console.log('📊 GTM: begin_checkout', { value, items: items.length });
  }
};

/**
 * Dispara evento de adicionar informação de pagamento
 */
export const trackAddPaymentInfo = (paymentMethod: string, value: number) => {
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddPaymentInfo', {
      value: value,
      currency: 'BRL',
      payment_type: paymentMethod
    });
    console.log('📊 FB Pixel: AddPaymentInfo', { paymentMethod, value });
  }

  // Google Analytics via GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'add_payment_info',
      ecommerce: {
        value: value,
        currency: 'BRL',
        payment_type: paymentMethod
      }
    });
    console.log('📊 GTM: add_payment_info', { paymentMethod, value });
  }
};

/**
 * Dispara evento de compra (CONVERSÃO)
 */
export const trackPurchase = (
  orderId: string,
  items: CartItem[],
  value: number,
  couponCode?: string
) => {
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: items.map(item => item.id),
      content_type: 'product',
      value: value,
      currency: 'BRL',
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      contents: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        item_price: item.price
      }))
    });
    console.log('🎉 FB Pixel: Purchase', { orderId, value, items: items.length });
  }

  // Google Analytics via GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: orderId,
        value: value,
        currency: 'BRL',
        coupon: couponCode || '',
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          item_category: item.category,
          quantity: item.quantity
        }))
      }
    });
    console.log('🎉 GTM: purchase', { orderId, value, items: items.length });
  }
};

/**
 * Helper para verificar se tracking está disponível
 */
export const isTrackingAvailable = () => {
  if (typeof window === 'undefined') return false;

  const fbAvailable = typeof window.fbq === 'function';
  const gtmAvailable = Array.isArray(window.dataLayer);

  return { fbAvailable, gtmAvailable };
};
