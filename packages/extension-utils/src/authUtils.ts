/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import type { IApiSection, IApiSettings } from '@looker/sdk-rtl';
import { ApiSettings } from '@looker/sdk-rtl';

export type StorageLocation = 'session' | 'local';

/** Object returned from storage service */
export interface IStorageValue {
  /** Location of the stored object */
  location: StorageLocation;
  /** Stored string representation of the value (usually JSON) */
  value: string;
}

/**
 * An OAuth Session configuration provider
 */
export class OAuthConfigProvider extends ApiSettings {
  oauthClientId: string;
  constructor(
    settings: Partial<IApiSettings>,
    oauthClientId: string,
    private readonly configKey: string
  ) {
    super(settings);
    this.oauthClientId = oauthClientId;
  }

  private getStorage(key: string, defaultValue = ''): IStorageValue {
    let value = sessionStorage.getItem(key);
    if (value) {
      return {
        location: 'session',
        value,
      };
    }
    value = localStorage.getItem(key);
    if (value) {
      return {
        location: 'local',
        value,
      };
    }
    return {
      location: 'session',
      value: defaultValue,
    };
  }

  isConfigured(): boolean {
    // Required to be true otherwise SDK initialization fails
    return true;
  }

  getStoredConfig() {
    const storage = this.getStorage(this.configKey);
    let config = {
      base_url: '',
      looker_url: '',
      client_id: '',
      redirect_uri: '',
    };
    if (storage.value) {
      config = JSON.parse(storage.value);
    }
    return config;
  }

  authIsConfigured(): boolean {
    const config = this.getStoredConfig();
    return config.base_url !== '' && config.looker_url !== '';
  }

  readConfig(_section?: string): IApiSection {
    // Read server url values from storage
    let config = this.getStoredConfig();
    if (!this.authIsConfigured()) {
      // derive Looker server URL from base_url
      const url = new URL(this.base_url);
      const authServer = `${url.protocol}//${url.hostname}`;
      config = {
        base_url: this.base_url,
        looker_url: `${authServer}:9999`,
        client_id: this.oauthClientId,
        redirect_uri: `${window.location.origin}/oauth`,
      };
    }

    const { base_url, looker_url, client_id, redirect_uri } = config;
    /* update base_url to the dynamically determined value for standard transport requests */
    this.base_url = base_url;
    return {
      ...super.readConfig(_section),
      ...{
        base_url,
        looker_url,
        client_id,
        redirect_uri,
      },
    };
  }
}
