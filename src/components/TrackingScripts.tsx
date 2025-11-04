import { useEffect } from 'react';

export const TrackingScripts = () => {
  useEffect(() => {
    const loadTrackingPixels = async () => {
      try {
        const response = await fetch('/api/tracking-pixels');
        if (!response.ok) return;

        const pixels = await response.json();

        // Meta Pixel (Facebook)
        if (pixels.meta_pixel_enabled && pixels.meta_pixel_id) {
          const metaScript = document.createElement('script');
          metaScript.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixels.meta_pixel_id}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(metaScript);

          const noscript = document.createElement('noscript');
          noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixels.meta_pixel_id}&ev=PageView&noscript=1"/>`;
          document.body.appendChild(noscript);
        }

        // Google Analytics
        if (pixels.google_analytics_enabled && pixels.google_analytics_id) {
          const gaScript1 = document.createElement('script');
          gaScript1.async = true;
          gaScript1.src = `https://www.googletagmanager.com/gtag/js?id=${pixels.google_analytics_id}`;
          document.head.appendChild(gaScript1);

          const gaScript2 = document.createElement('script');
          gaScript2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${pixels.google_analytics_id}');
          `;
          document.head.appendChild(gaScript2);
        }

        // Google Tag Manager
        if (pixels.google_tag_manager_enabled && pixels.google_tag_manager_id) {
          const gtmScript = document.createElement('script');
          gtmScript.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${pixels.google_tag_manager_id}');
          `;
          document.head.appendChild(gtmScript);

          const gtmNoscript = document.createElement('noscript');
          gtmNoscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${pixels.google_tag_manager_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
          document.body.insertBefore(gtmNoscript, document.body.firstChild);
        }
      } catch (error) {
        console.error('Erro ao carregar tracking pixels:', error);
      }
    };

    loadTrackingPixels();
  }, []);

  return null;
};
