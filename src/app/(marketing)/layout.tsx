import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans" style={{ color: 'var(--foreground)' }}>
            <SiteHeader />
            <main id="main-content" className="flex-1 flex flex-col relative w-full overflow-x-hidden">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
