import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['ar', 'fr', 'en'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validLocale = locales.includes(locale as any) ? locale : 'ar';

  return {
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});
