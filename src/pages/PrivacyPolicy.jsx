import { useEffect } from "react";
import { Shield, Lock, Eye, Server, RefreshCw, UserCheck } from "lucide-react";

const PrivacyPolicy = () => {
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
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
            Your trust is our most valuable asset. Learn how we protect and manage your information at Postify.
          </p>
          <div className="mt-8 inline-block px-4 py-1.5 bg-blue-800/40 rounded-full text-[11px] font-bold uppercase tracking-widest text-blue-200 border border-blue-700/50">
            Updated March 28, 2026
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 max-w-4xl mx-auto px-6 -mt-10 mb-20 relative z-20">
        <div className="bg-white rounded-[40px] shadow-xl border border-blue-50/50 p-8 md:p-14 space-y-12">
          
          <section className="prose prose-blue max-w-none text-gray-600">
            <p className="text-xl leading-relaxed font-medium text-gray-700">
              At Postify, protecting your privacy is one of our top priorities. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <UserCheck className="w-5 h-5" />
                <h2 className="text-lg font-bold tracking-tight text-gray-900 border-b-2 border-blue-100 pb-1">Information We Collect</h2>
              </div>
              <div className="text-[15px] leading-relaxed space-y-4">
                <p>
                  When you create an account on Postify, we may collect personal information such as your name, email address, and login credentials. This information is necessary to create and manage your account and allow you to access our services.
                </p>
                <p>
                  In addition to the information you provide, we may automatically collect certain technical data when you use the platform. This may include your device type, browser information, IP address, and interaction data such as pages visited or features used.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <RefreshCw className="w-5 h-5" />
                <h2 className="text-lg font-bold tracking-tight text-gray-900 border-b-2 border-blue-100 pb-1">How We Use Your Information</h2>
              </div>
              <div className="text-[15px] leading-relaxed space-y-4">
                <p>
                  The information collected by Postify is used to operate and maintain the platform. It allows us to provide our services, manage user accounts, and ensure security.
                </p>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. Your data is used strictly to operate and improve the services provided by Postify.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Lock className="w-5 h-5" />
                <h2 className="text-lg font-bold tracking-tight text-gray-900 border-b-2 border-blue-100 pb-1">Data Protection</h2>
              </div>
              <div className="text-[15px] leading-relaxed space-y-4">
                <p>
                  We take reasonable technical and organizational measures to protect your personal information from unauthorized access, misuse, or disclosure.
                </p>
                <p>
                  Users are encouraged to keep their account credentials secure and avoid sharing them with others to maintain the integrity of their data.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Server className="w-5 h-5" />
                <h2 className="text-lg font-bold tracking-tight text-gray-900 border-b-2 border-blue-100 pb-1">Data Retention</h2>
              </div>
              <div className="text-[15px] leading-relaxed space-y-4">
                <p>
                  We retain your information only for as long as it is necessary to provide our services or comply with legal obligations.
                </p>
                <p>
                  If you choose to delete your account, we will remove or anonymize your personal data from our active systems where reasonably possible.
                </p>
              </div>
            </section>
          </div>

          <section className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
            <div className="flex items-center gap-3 text-blue-600 mb-4">
              <Eye className="w-6 h-6" />
              <h2 className="text-xl font-bold tracking-tight text-gray-900">User Rights & Third Parties</h2>
            </div>
            <div className="text-[15px] leading-relaxed text-gray-700 space-y-4">
              <p>
                Postify may integrate with third-party tools to enhance functionality. We recommend reviewing their privacy policies to understand how they manage user data.
              </p>
              <p>
                Users have the right to request access to their data, update account information, or request account deletion. Such requests can be made by contacting our support team.
              </p>
              <p className="font-bold text-gray-900 pt-4">
                By using Postify, you agree to the practices described in this Privacy Policy.
              </p>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
