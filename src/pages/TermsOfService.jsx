import { useEffect } from "react";
import { ScrollText, ShieldAlert, UserPlus, Globe, Loader, AlertTriangle, CheckCircle } from "lucide-react";

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Blue Header Section */}
      <header className="bg-blue-600 text-white py-16 px-6 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/30 rounded-2xl mb-6 backdrop-blur-sm border border-blue-400/20">
            <ScrollText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Terms of Service</h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
            Welcome to Postify. By using our platform, you agree to follow the rules and conditions outlined below.
          </p>
          <div className="mt-8 inline-block px-4 py-1.5 bg-blue-800/40 rounded-full text-[11px] font-bold uppercase tracking-widest text-blue-200 border border-blue-700/50">
            Updated March 28, 2026
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 max-w-4xl mx-auto px-6 -mt-10 mb-20 relative z-20">
        <div className="bg-white rounded-[40px] shadow-xl border border-blue-50/50 p-8 md:p-14 space-y-12 text-gray-700">
          
          <section className="prose prose-blue max-w-none text-gray-600">
            <p className="text-xl leading-relaxed font-medium text-gray-700">
              These Terms of Service outline the rules and conditions for using the Postify platform. By accessing or using Postify, you agree to comply with these terms.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-12">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Globe className="w-5 h-5" />
                <h2 className="text-xl font-bold tracking-tight text-gray-900 border-b-2 border-blue-100 pb-1 w-full">Use of the Platform</h2>
              </div>
              <div className="text-[15px] leading-relaxed space-y-4">
                <p>
                  Postify provides tools that help users create, organize, and manage digital content. The platform is intended for lawful use only. Users must not use the platform for activities that violate applicable laws or regulations.
                </p>
                <p>
                  Users are responsible for the content they create, upload, or share using Postify. Content that infringes intellectual property rights, promotes illegal activities, spreads harmful material, or violates community standards is strictly prohibited.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <UserPlus className="w-5 h-5" />
                <h2 className="text-xl font-bold tracking-tight text-gray-900 border-b-2 border-blue-100 pb-1 w-full">User Accounts</h2>
              </div>
              <div className="text-[15px] leading-relaxed space-y-4">
                <p>
                  To access certain features, users may be required to create an account. When creating an account, users must provide accurate and complete information. Users are responsible for maintaining the confidentiality of their login credentials.
                </p>
                <p>
                  If you believe your account has been accessed without authorization, you should notify us immediately to protect your data and the community.
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <Loader className="w-5 h-5" />
                  <h2 className="text-lg font-bold tracking-tight text-gray-900 border-b-2 border-blue-100 pb-1">Platform Availability</h2>
                </div>
                <div className="text-[14px] leading-relaxed">
                  Postify does not guarantee uninterrupted access. Maintenance, updates, or technical issues may occasionally affect service availability.
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <ShieldAlert className="w-5 h-5" />
                  <h2 className="text-lg font-bold tracking-tight text-gray-900 border-b-2 border-blue-100 pb-1">Suspension & Termination</h2>
                </div>
                <div className="text-[14px] leading-relaxed">
                  Postify reserves the right to suspend or terminate accounts that violate these terms, or engage in harmful or illegal activities.
                </div>
              </section>
            </div>

            <section className="bg-blue-50 rounded-3xl p-8 border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <AlertTriangle className="w-6 h-6" />
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">Important Notices</h2>
                </div>
                <div className="text-[14px] leading-relaxed text-gray-700 space-y-3">
                  <p>
                    <span className="font-bold">Changes to Service:</span> Postify may update or modify features from time to time to improve the platform. Continued use indicates acceptance.
                  </p>
                  <p>
                    <span className="font-bold">Limitation of Liability:</span> Postify is provided on an "as-is" basis. We cannot guarantee freedom from all technical issues.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center border-l border-blue-200 px-6 py-4 text-center">
                 <CheckCircle className="w-12 h-12 text-blue-500 mb-4 opacity-80" />
                 <h3 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-widest">Acceptance</h3>
                 <p className="text-sm text-gray-600 leading-relaxed font-medium">
                   By using Postify, you confirm that you have read, understood, and agreed to these Terms of Service.
                 </p>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
