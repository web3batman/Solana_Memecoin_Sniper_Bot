import { Outlet } from 'react-router-dom';
import Header from './pages/header/header';

const MintLayout = () => {
    return (
        <div>
            <Header />
            <Outlet />
        </div>
    );
};

export default MintLayout;