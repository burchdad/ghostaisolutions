export const metadata = {
  metadataBase: new URL('https://ghostai.solutions'),
  title: 'Ghost AI Solutions — Automate Smarter. Scale Faster.',
  description: 'AI agents for measurable business impact — strategy, custom agents, and ethical governance.',
  openGraph: {
    title: 'Ghost AI Solutions — Automate Smarter. Scale Faster.',
    description: 'AI agents for measurable business impact — strategy, custom agents, and ethical governance.',
    url: 'https://ghostai.solutions',
    siteName: 'Ghost AI Solutions',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  icons: {
    icon: '/favicon.ico',
  },
};

import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-body">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-white focus:text-ink focus:rounded-lg focus:shadow">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}


function ScriptBundle(){
  // little helpers: theme toggle text & footer year
  return (
    <>
      <script dangerouslySetInnerHTML={{__html:`
        const root = document.documentElement;
        const applyTheme = (isDark)=>{ if(isDark){ root.classList.add('dark'); document.body.classList.remove('bg-white','text-slate-900'); document.body.classList.add('bg-ink','text-slate-100'); } else { root.classList.remove('dark'); document.body.classList.remove('bg-ink','text-slate-100'); document.body.classList.add('bg-white','text-slate-900'); } localStorage.setItem('ghost-theme', isDark?'dark':'light'); };
        const initTheme=()=>{ const saved=localStorage.getItem('ghost-theme'); const prefers=window.matchMedia('(prefers-color-scheme: dark)').matches; applyTheme(saved? saved==='dark': prefers); setBtnText(); };
        const setBtnText=()=>{ const dark=root.classList.contains('dark'); const el1=document.getElementById('themeToggle'); const el2=document.getElementById('themeToggleM'); if(el1) el1.textContent = dark?'Light':'Dark'; if(el2) el2.textContent = dark?'Light':'Dark'; };
        window.addEventListener('DOMContentLoaded',()=>{ initTheme(); const t1=document.getElementById('themeToggle'); const t2=document.getElementById('themeToggleM'); t1&&t1.addEventListener('click',()=>{applyTheme(!root.classList.contains('dark')); setBtnText();}); t2&&t2.addEventListener('click',()=>{applyTheme(!root.classList.contains('dark')); setBtnText();}); const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear(); const mb=document.getElementById('menuBtn'); const mnav=document.getElementById('mnav'); mb&&mb.addEventListener('click',()=>{ const isHidden=mnav.classList.toggle('hidden'); mb.setAttribute('aria-expanded', (!isHidden).toString()); }); });
      `}} />
    </>
  )
}
