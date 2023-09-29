import Home from "./components/Home.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Gallery from "./components/Gallery.tsx";
import Mint from "@/components/Mint.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import {ThemeProvider} from './store/ThemeProvider.tsx';
import {MetaMaskContextProvider} from './store/MetaMaskContextProvider';
import NotFound from "@/components/NotFound.tsx";
import {ErrorBoundary} from "react-error-boundary";
import ErrorPage from "./ErrorPage.tsx";

const AppProviders = () => (
    <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <MetaMaskContextProvider>
                <ErrorBoundary FallbackComponent={ErrorPage}>
                    <Routes>
                        <Route path={"/gallery"} element={<Gallery/>}/>
                        <Route path={"/mint"} element={<Mint/>}/>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/*" element={<NotFound/>}/>
                    </Routes>
                    <Toaster/>
                </ErrorBoundary>
            </MetaMaskContextProvider>
        </ThemeProvider>
    </BrowserRouter>
);

export default AppProviders

