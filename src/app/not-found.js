import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="flex justify-center items-center flex-col h-screen w-full">
            <h1 className="text-white text-4xl mb-4">404 Page not found</h1>
            <br/>
            <Image src="/images/404.gif" alt="404 GIF" width={500} height={500} />
        </div>
    );
}