
import QRScanner from '../components/QRScanner';
import SleekFooter from '../components/Footer';

export default function ScanPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-green-900 to-blue-900">
      <div className="flex-1 flex items-center justify-center px-4 py-10 md:py-20">
        <QRScanner />
      </div>
      <div className="mt-8">
        <SleekFooter />
      </div>
    </div>
  );
}
