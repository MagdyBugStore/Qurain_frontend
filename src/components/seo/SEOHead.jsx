import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const SITE_URL = process.env.REACT_APP_SITE_URL || "https://quran-platform.com";
const SITE_NAME = "منصة القرآن | Quran Platform";

export function SEOHead({ 
  title, 
  description, 
  keywords,
  image,
  type = "website",
  noindex = false,
  geoLocation
}) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  
  const defaultTitle = isArabic 
    ? "منصة القرآن - تعلم القرآن الكريم عبر الإنترنت" 
    : "Quran Platform - Learn Quran Online";
  
  const defaultDescription = isArabic
    ? "منصة متخصصة لتعلم القرآن الكريم عبر الإنترنت مع معلمين معتمدين. برامج شاملة تشمل التلاوة، التجويد، الحفظ، واللغة العربية."
    : "Specialized platform for learning the Holy Quran online with certified teachers. Comprehensive programs including recitation, tajweed, memorization, and Arabic language.";

  const defaultKeywords = isArabic
    ? "تعلم القرآن, تحفيظ القرآن, تجويد, تلاوة, اللغة العربية, دروس قرآنية أونلاين, معلمين قرآن معتمدين"
    : "learn quran, quran memorization, tajweed, quran recitation, arabic language, online quran classes, certified quran teachers";

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalImage = image || `${SITE_URL}/og-image.jpg`;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic SEO Meta Tags
    updateMetaTag("description", finalDescription);
    updateMetaTag("keywords", finalKeywords);
    updateMetaTag("author", SITE_NAME);
    updateMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow");
    updateMetaTag("language", isArabic ? "ar" : "en");
    updateMetaTag("revisit-after", "7 days");

    // Open Graph Meta Tags
    updateMetaTag("og:title", finalTitle, "property");
    updateMetaTag("og:description", finalDescription, "property");
    updateMetaTag("og:image", finalImage, "property");
    updateMetaTag("og:url", window.location.href, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:site_name", SITE_NAME, "property");
    updateMetaTag("og:locale", isArabic ? "ar_SA" : "en_US", "property");
    if (isArabic) {
      updateMetaTag("og:locale:alternate", "en_US", "property");
    } else {
      updateMetaTag("og:locale:alternate", "ar_SA", "property");
    }

    // Twitter Card Meta Tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", finalTitle);
    updateMetaTag("twitter:description", finalDescription);
    updateMetaTag("twitter:image", finalImage);

    // Geo Location Meta Tags
    if (geoLocation) {
      updateMetaTag("geo.region", geoLocation.region || "SA");
      updateMetaTag("geo.placename", geoLocation.placename || "Saudi Arabia");
      if (geoLocation.latitude && geoLocation.longitude) {
        updateMetaTag("geo.position", `${geoLocation.latitude};${geoLocation.longitude}`);
        updateMetaTag("ICBM", `${geoLocation.latitude}, ${geoLocation.longitude}`);
      }
    }

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);

    // Alternate language links
    const currentPath = window.location.pathname;
    let alternateAr = document.querySelector("link[rel='alternate'][hreflang='ar']");
    let alternateEn = document.querySelector("link[rel='alternate'][hreflang='en']");
    
    if (!alternateAr) {
      alternateAr = document.createElement("link");
      alternateAr.setAttribute("rel", "alternate");
      alternateAr.setAttribute("hreflang", "ar");
      document.head.appendChild(alternateAr);
    }
    alternateAr.setAttribute("href", `${SITE_URL}${currentPath}?lang=ar`);

    if (!alternateEn) {
      alternateEn = document.createElement("link");
      alternateEn.setAttribute("rel", "alternate");
      alternateEn.setAttribute("hreflang", "en");
      document.head.appendChild(alternateEn);
    }
    alternateEn.setAttribute("href", `${SITE_URL}${currentPath}?lang=en`);

    // Structured Data (JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": SITE_NAME,
      "alternateName": isArabic ? "منصة القرآن" : "Quran Platform",
      "url": SITE_URL,
      "logo": `${SITE_URL}/logo512.png`,
      "description": finalDescription,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "SA",
        "addressRegion": "Riyadh"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "availableLanguage": ["Arabic", "English"]
      },
      "sameAs": [
        // Add social media links here if available
      ],
      "offers": {
        "@type": "Offer",
        "category": "Online Quran Learning"
      }
    };

    if (geoLocation) {
      structuredData.geo = {
        "@type": "GeoCoordinates",
        "latitude": geoLocation.latitude || 24.7136,
        "longitude": geoLocation.longitude || 46.6753
      };
    }

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [finalTitle, finalDescription, finalKeywords, finalImage, type, noindex, isArabic, geoLocation]);

  return null;
}
