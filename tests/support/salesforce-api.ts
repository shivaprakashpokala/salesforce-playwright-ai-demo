import type { Connection } from 'jsforce';
import { connectionFrom, loadSession } from './salesforce-auth';

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
 * Thin wrapper over jsforce, using the connection made at sign-in.
 * Used to check what was really saved and to set up and clean up test data.
 * Not used to drive the UI.
 */
export class SalesforceApi {
  constructor(private readonly connection: Connection) {}

  /** Reuse the session the sign-in setup saved. */
  static fromSavedSession(): SalesforceApi {
    return new SalesforceApi(connectionFrom(loadSession()));
  }

  async casesWithSubject(subject: string): Promise<CaseRecord[]> {
    const result = await this.connection.query<CaseRecord>(
      'SELECT Id, CaseNumber, Subject, Status, Priority, Origin, Type FROM Case ' +
        `WHERE Subject = '${subject.replace(/'/g, "\\'")}'`,
    );
    return result.records;
  }

  async createCase(fields: { Subject: string; Origin: string; Status?: string; Priority?: string }): Promise<string> {
    const result = await this.connection.sobject('Case').create(fields);
    if (!result.success) throw new Error(`Salesforce create failed: ${JSON.stringify(result.errors)}`);
    return result.id;
  }

  async deleteCase(id: string): Promise<void> {
    await this.connection.sobject('Case').destroy(id);
  }
}
