import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';

interface LayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className='h-screen flex flex-col'>
      <div className='sticky top-0 z-50 bg-[#201a50] text-white p-3 font-bold uppercase text-center text-sm flex items-center justify-center shrink-0 w-full'>
        <img 
          src="/ustp-logo-white.png"
          alt="USTP Logo" 
          className="h-8 mr-3"
        />
        University of Science and Technology of Southern Philippines
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
        }`}>
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}

export default Layout;
