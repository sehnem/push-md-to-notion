import { Client } from '@notionhq/client';
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';
import { markdownToBlocks } from '@tryfabric/martian';

/**
 * Class for managing Notion client state and methods needed for the action.
 */
export class NotionApi {
  private client: Client;
  constructor(token: string) {
    this.client = new Client({
      auth: token,
    });
  }

  public async updatePageTitle(pageId: string, title: string, link?: string) {
    await this.client.pages.update({
      page_id: pageId,
      properties: {
        title: {
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: title,
                link: link ? { url: link } : undefined
              },
            },
          ],
        },
      },
    });
  }

  public async updatePageStatus(pageId: string, status: string, propertyName = 'Sync status') {
    await this.client.pages.update({
      page_id: pageId,
      properties: {
        [propertyName]: {
          type: 'status',
          status: {
            name: status
          }
        }
      }
    });
  }

  public async updatePageUrl(pageId: string, url: string, propertyName = 'GitHub URL') {
    await this.client.pages.update({
      page_id: pageId,
      properties: {
        [propertyName]: {
          type: 'url',
          url: url
        }
      }
    });
  }

  public async updateDocumentStatus(pageId: string, status: string, propertyName = 'Status') {
    await this.client.pages.update({
      page_id: pageId,
      properties: {
        [propertyName]: {
          type: 'status',
          status: {
            name: status
          }
        }
      }
    });
  }

  public async updateVersion(pageId: string, version: string, propertyName = 'Version') {
    await this.client.pages.update({
      page_id: pageId,
      properties: {
        [propertyName]: {
          type: 'rich_text',
          rich_text: [{
            type: 'text',
            text: {
              content: version
            }
          }]
        }
      }
    });
  }

  public async clearBlockChildren(blockId: string) {
    for await (const block of this.listChildBlocks(blockId)) {
      await this.client.blocks.delete({
        block_id: block.id,
      });
    }
  }

  /**
   * Convert markdown to the notion block data format and append it to an existing block.
   * @param blockId Block which the markdown elements will be appended to.
   * @param md Markdown as string.
   */
  public async appendMarkdown(
    blockId: string,
    md: string,
    preamble: BlockObjectRequest[] = []
  ) {
    const allBlocks = [...preamble, ...markdownToBlocks(md)] as BlockObjectRequest[];
    // Notion API has a limit of 100 children per request, so we need to chunk them
    const chunkSize = 100;

    for (let i = 0; i < allBlocks.length; i += chunkSize) {
      const chunk = allBlocks.slice(i, i + chunkSize);
      await this.client.blocks.children.append({
        block_id: blockId,
        children: chunk,
      });
    }
  }

  /**
   * Iterate over all of the childeren of a given block. This manages the underlying paginated API.
   * @param blockId Block being listed.
   * @param batchSize Number of childeren to fetch in each call to notion. Max 100.
   */
  public async *listChildBlocks(blockId: string, batchSize = 50) {
    let has_more = true;
    do {
      const blocks = await this.client.blocks.children.list({
        block_id: blockId,
        page_size: batchSize,
      });

      for (const block of blocks.results) {
        yield block;
      }

      has_more = blocks.has_more;
    } while (has_more);
  }
}

export interface NotionFrontmatter {
  notion_page: string;
  title?: string;
  status?: string;
  version?: string | number;
  description?: string;
  authors?: string;
  [key: string]: unknown;
}

export function isNotionFrontmatter(fm: unknown): fm is NotionFrontmatter {
  const castFm = fm as NotionFrontmatter;
  return (
    typeof castFm?.notion_page === 'string' &&
    (typeof castFm?.title === 'string' || typeof castFm?.title === 'undefined')
  );
}
