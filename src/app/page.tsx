import SearchBar from "@/components/SearchBar";

export default function Home() {
    return (
        <>
            <div className="flex flex-col items-center text-center mt-32">
                <h1 className="text-6xl font-semibold">
                    Know everything about
                    <br />
                    your next <span className="text-purple-700 text-7xl">chess</span> opponent.
                </h1>
            </div>

            <SearchBar></SearchBar>
        </>
    );
}