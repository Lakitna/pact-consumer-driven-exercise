/**
 * The consumer's piece of the puzzle: a thin client for the Comic Book Catalogue API.
 *
 * This is the code under test. Notice it knows nothing about Pact - contract tests
 * wrap around ordinary client code. The only concession to testability is that the
 * base URL can be injected, so tests can point it at a mock instead of production.
 *
 * House style: every error response from this API is RFC 7807 problem+json
 * ({ status, title, detail, ... }). The client reads `title` for user-facing errors.
 */

class ComicCatalogueClient {
  /** @param {string} baseUrl e.g. http://127.0.0.1:9500 or a Pact mock server URL */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /** Fetch one comic issue by number. Returns the parsed body, or null for 404. */
  async getComic(num) {
    const res = await fetch(`${this.baseUrl}/api/comics/${num}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`unexpected status ${res.status}`);
    }

    return res.json();
  }

  /** Record that someone read a comic. Provider answers 201 with the updated counter. */
  async markAsRead(num) {
    const res = await fetch(`${this.baseUrl}/api/comics/${num}/read`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error(`markAsRead failed with status ${res.status}`);
    }

    return res.json();
  }
}

export { ComicCatalogueClient };
