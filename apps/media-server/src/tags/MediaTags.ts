// export interface Media Tag
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
export class MediaTag {
    id: string;
    name: string;
    children: Array<MediaTag>

    constructor(name: string) {
        this.name = name;
        this.id = uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals]
        });
        this.children = []
    }
}

export class MediaTagTree {
    root: MediaTag;

    constructor(rootName: string = 'root') {
        this.root = new MediaTag(rootName);
    }

    private findNode(id: string, node: MediaTag = this.root): MediaTag | undefined {
        if (node.id === id) {
            return node;
        }
        for (const child of node.children) {
            const found = this.findNode(id, child);
            if (found) {
                return found;
            }
        }
        return undefined;
    }

    findById(id: string): MediaTag | undefined {
        return this.findNode(id);
    }

    findByName(name: string, node: MediaTag = this.root): MediaTag | undefined {
        if (node.name === name) {
            return node;
        }
        for (const child of node.children) {
            const found = this.findByName(name, child);
            if (found) {
                return found;
            }
        }
        return undefined;
    }

    addTag(name: string, parentId: string = this.root.id): MediaTag {
        const parent = this.findNode(parentId);
        if (!parent) {
            throw new Error(`Parent tag with id "${parentId}" not found`);
        }
        const tag = new MediaTag(name);
        parent.children.push(tag);
        return tag;
    }

    removeTag(id: string, node: MediaTag = this.root): boolean {
        const index = node.children.findIndex(child => child.id === id);
        if (index !== -1) {
            node.children.splice(index, 1);
            return true;
        }
        for (const child of node.children) {
            if (this.removeTag(id, child)) {
                return true;
            }
        }
        return false;
    }

    *traverseDepthFirst(node: MediaTag = this.root): Generator<MediaTag> {
        yield node;
        for (const child of node.children) {
            yield* this.traverseDepthFirst(child);
        }
    }

    *traverseBreadthFirst(): Generator<MediaTag> {
        const queue: Array<MediaTag> = [this.root];
        while (queue.length > 0) {
            const node = queue.shift()!;
            yield node;
            queue.push(...node.children);
        }
    }

    toArray(): Array<MediaTag> {
        return [...this.traverseDepthFirst()];
    }
}
