// app/services/bloomFilter.ts
import { BloomFilter } from 'bloom-filters';

export class PlayerBloomFilter {
    private static instance: PlayerBloomFilter;
    private filter: BloomFilter;
    private initialized = false;

    private constructor() {
        // Pour 1.5M joueurs, avec un taux de faux positifs de 0.1%
        this.filter = new BloomFilter(1500000, 0.001);
    }

    static getInstance(): PlayerBloomFilter {
        if (!PlayerBloomFilter.instance) {
            PlayerBloomFilter.instance = new PlayerBloomFilter();
        }
        return PlayerBloomFilter.instance;
    }

    async initialize(names: string[]) {
        if (this.initialized) return;

        names.forEach(name => {
            if (name) {
                this.filter.add(name.toLowerCase());
                name.toLowerCase().split(' ').forEach(part => {
                    this.filter.add(part);
                });
            }
        });

        this.initialized = true;
    }

    mightContain(query: string): boolean {
        return this.filter.has(query.toLowerCase());
    }

    isInitialized(): boolean {
        return this.initialized;
    }
}