/**
 * Exercise 3 - the consumer's client.
 *
 * The ReadingApp now shows a shelf of "continue reading" comics and lets users rate
 * them. Read the methods to see what the consumer actually needs from each response -
 * that need is what the contract must capture, nothing more.
 */

class ComicCatalogueClient {
  /** @param {string} baseUrl e.g. http://127.0.0.1:9503 or a Pact mock server URL */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Shelf of comics the user should continue reading. Needs: an array (possibly
   * empty) where each entry has id, title, publishedOn and pagesRead.
   */
  async getContinueReading(userId) {
    const res = await fetch(`${this.baseUrl}/api/users/${userId}/continue-reading`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`getContinueReading failed with status ${res.status}`);
    }
    return res.json();
  }

  /**
   * Rate a comic. Needs: 200 back with the stored rating echoed as a number.
   */
  async rateComic(num, stars) {
    const res = await fetch(`${this.baseUrl}/api/comics/${num}/rating`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stars }),
    });
    if (!res.ok) {
      throw new Error(`rateComic failed with status ${res.status}`);
    }
    return res.json();
  }
}

export { ComicCatalogueClient };
