export async function suggestWords(keyword) {
    const res = await fetch(
        `https://api.datamuse.com/sug?s=${encodeURIComponent(keyword)}`,
    );
    return await res.json();
}
