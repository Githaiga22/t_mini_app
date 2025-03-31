import ZapBaseApp from "./components/LandingPage";
import { Providers } from './Providers';
 
export default function App() {
  return (
    <Providers>
      <ZapBaseApp />
    </Providers>
  );
}