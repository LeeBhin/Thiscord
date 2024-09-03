export default function DM({ params }) {
    const { userId } = params;

    return (
        <>
            userId: {userId}
        </>
    );
}