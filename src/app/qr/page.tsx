
import QRGenerator from '../components/QRGenerator';
import SleekFooter from '../components/Footer';

export default function QRPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <div className="flex-1 w-full px-2 md:px-4 lg:px-6 py-6">
        <QRGenerator />
      </div>
      <SleekFooter />
    </div>
  );
}
