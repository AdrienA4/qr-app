
import QRGenerator from '../components/QRGenerator';
import SleekFooter from '../components/Footer';

export default function QRPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <QRGenerator />
      </div>
      <SleekFooter />
    </div>
  );
}
