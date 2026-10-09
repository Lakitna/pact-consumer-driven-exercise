/**
 * Exercise 2 - the consumer's client. READ THIS CODE FIRST.
 *
 * The ReadingApp now shows a list of comics and marks them read. Each method tells
 * you what the consumer NEEDS from the provider - that need is the contract, no
 * matter what the provider currently happens to return.
 *
 * House style: every error response is RFC 7807 application/problem+json.
 */

class ComicCatalogueClient {
  /** @param {string} baseUrl e.g. http://127.0.0.1:9502 or a Pact mock server URL */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * List comic issues, newest first. Needs: an array of comic summaries, each with
   * at least `id`, `title` and `publishedOn`.
   */
  async listComics(limit) {
    const res = await fetch(`${this.baseUrl}/api/comics?limit=${limit}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`listComics failed with status ${res.status}`);
    }
    return res.json();
  }

  /**
   * Record that someone read a comic. Needs: HTTP 201 back, with the updated
   * `readCount` in the body so the UI can show it right away.
   */
  async markAsRead(num) {
    const res = await fetch(`${this.baseUrl}/api/comics/${num}/read`, {
      method: 'POST',
    });
    if (res.status !== 201) {
      throw new Error(`markAsRead expected 201, got ${res.status}`);
    }
    return res.json();
  }

  /**
   * Look up one comic. Needs: 404 answered with JSON containing an `error` field,
   * which the app shows as "not available". (The provider team has since moved to
   * RFC 7807 problem+json - you'll discover that in step 2.)
   */
  async getComic(num) {
    const res = await fetch(`${this.baseUrl}/api/comics/${num}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.status === 404) {
      const body = await res.json();
      return { notFound: true, message: body.error };
    }
    if (!res.ok) {
      throw new Error(`unexpected status ${res.status}`);
    }
    return res.json();
  }
}

export { ComicCatalogueClient };
