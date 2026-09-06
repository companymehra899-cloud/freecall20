import { useAppStore } from './useAppStore';
import PhoneMockup from './screens/PhoneMockup';

export default function App() {
  const store = useAppStore();

  return (
    <div className="h-dvh w-full bg-[#07080b] text-slate-100 overflow-hidden">
      <PhoneMockup store={store} />
    </div>
  );
}
