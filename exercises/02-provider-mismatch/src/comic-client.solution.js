/**
 * Exercise 2 - REFERENCE SOLUTION client (instructor copy).
 *
 * The consumer code updated to live with the provider that actually exists:
 *   - listComics returns the envelope object and reads .comics where needed
 *   - markAsRead accepts 200
 *   - getComic reads body.title from the problem+json response on 404
 */

class ComicCatalogueClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async listComics(limit) {
    const res = await fetch(`${this.baseUrl}/api/comics?limit=${limit}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`listComics failed with status ${res.status}`);
    }
    return res.json();
  }

  async markAsRead(num) {
    const res = await fetch(`${this.baseUrl}/api/comics/${num}/read`, {
      method: 'POST',
    });
    if (res.status !== 200) {
      throw new Error(`markAsRead expected 200, got ${res.status}`);
    }
    return res.json();
  }

  async getComic(num) {
    const res = await fetch(`${this.baseUrl}/api/comics/${num}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.status === 404) {
      const body = await res.json();
      return { notFound: true, message: body.title };
    }
    if (!res.ok) {
      throw new Error(`unexpected status ${res.status}`);
    }
    return res.json();
  }
}

export { ComicCatalogueClient };
