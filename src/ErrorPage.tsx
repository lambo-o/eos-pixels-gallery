import {FC} from 'react';
import {Button} from './components/ui/button';
import {Card} from "@/components/ui/card.tsx";

type ErrorPageProps = { error: any, resetErrorBoundary: any }

const ErrorPage: FC<ErrorPageProps> = ({error, resetErrorBoundary}) => {
    return (
        <div className="container px-5 md:px-20 lg:px-60  mx-auto flex flex-col gap-5 my-5">
            <Card className={'flex flex-col'}>
                <div className={'flex flex-col gap-2'}>
                    <div>{error.message}</div>
                    <div>Something went wrong:</div>
                </div>
                <Button onClick={resetErrorBoundary}>Try again</Button>
            </Card>
        </div>
    );
}

export default ErrorPage;
