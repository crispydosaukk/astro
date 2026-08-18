import LandingPageView from './components/LandingPageView';
import { getHomepageContent } from '@/lib/cms';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LandingPage() {
  const content = await getHomepageContent();

  return <LandingPageView initialContent={content} />;
}
