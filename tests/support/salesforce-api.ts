import type { APIRequestContext, BrowserContext } from '@playwright/test';

export interface CaseRecord {
  Id: string;
  CaseNumber: string;
  Subject: string;
  Status: string;
  Priority: string;
  Origin: string;
  Type: string | null;
}

/**
 * Thin wrapper over the Salesforce REST API, signed in with the browser's own session.
 * Used to check what was really saved and to clean up test data. Not used to drive the UI.
 */
export class SalesforceApi {
  private constructor(
    private readonly request: APIRequestContext,
    private readonly instanceUrl: string,
    private readonly sessionId: string,
  ) {}

  static async from(context: BrowserContext): Promise<SalesforceApi> {
    const session = (await context.cookies()).find((c) => c.name === 'sid' && c.domain.endsWith('.my.salesforce.com'));
    if (!session) throw new Error('No Salesforce session found. Did the sign-in setup run?');
    return new SalesforceApi(context.request, `https://${session.domain.replace(/^\./, '')}`, session.value);
  }

  private get headers() {
    return { Authorization: `Bearer ${this.sessionId}` };
  }

  async casesWithSubject(subject: string): Promise<CaseRecord[]> {
    const soql =
      'SELECT Id, CaseNumber, Subject, Status, Priority, Origin, Type FROM Case ' +
      `WHERE Subject = '${subject.replace(/'/g, "\\'")}'`;
    const response = await this.request.get(`${this.instanceUrl}/services/data/v60.0/query`, {
      headers: this.headers,
      params: { q: soql },
    });
    if (!response.ok()) throw new Error(`Salesforce query failed: ${response.status()} ${await response.text()}`);
    return (await response.json()).records;
  }

  async createCase(fields: { Subject: string; Origin: string; Status?: string; Priority?: string }): Promise<string> {
    const response = await this.request.post(`${this.instanceUrl}/services/data/v60.0/sobjects/Case`, {
      headers: this.headers,
      data: fields,
    });
    if (!response.ok()) throw new Error(`Salesforce create failed: ${response.status()} ${await response.text()}`);
    return (await response.json()).id;
  }

  async deleteCase(id: string): Promise<void> {
    await this.request.delete(`${this.instanceUrl}/services/data/v60.0/sobjects/Case/${id}`, { headers: this.headers });
  }
}
