import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";

const NotFound = () => {
    return (
        <div className="container px-5 md:px-20 lg:px-60  mx-auto flex flex-col gap-5 my-5">
            <Alert>
                <AlertTitle>
                    Error!
                </AlertTitle>
                <AlertDescription>
                    Page not found!
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default NotFound;