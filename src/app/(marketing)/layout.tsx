import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col" style={{ color: '#F9F9F9', fontFamily: 'Source Sans 3, sans-serif' }}>
            <SiteHeader />
            <main id="main-content" className="flex-1 flex flex-col relative w-full overflow-x-hidden">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
