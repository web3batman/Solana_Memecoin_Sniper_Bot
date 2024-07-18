import { Header } from '../../pages/sniper/header';
import { Outlet } from 'react-router-dom';


const SniperLayout = () => {
    return (
        <div>
            <Header />
            <Outlet />
        </div>
    );
};

export default SniperLayout;