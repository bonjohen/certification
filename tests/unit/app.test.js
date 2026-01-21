/**
 * QuizApp Unit Tests
 * Tests for provider detection and utility functions
 */

import { describe, it, expect } from 'vitest';

// Since QuizApp is a class that initializes immediately and requires DOM,
// we test the provider detection logic separately by extracting the algorithm.

/**
 * Extracted provider detection logic from QuizApp.getProviderFromExam
 * This matches the implementation in js/app.js lines 218-241
 */
function getProviderFromExam(examId, metaProvider) {
    // Check metadata provider first
    if (metaProvider) {
        const p = metaProvider.toLowerCase();
        if (p.includes('azure') || p.includes('microsoft')) return 'azure';
        if (p.includes('aws') || p.includes('amazon')) return 'aws';
        if (p.includes('gcp') || p.includes('google')) return 'gcp';
    }

    // Fall back to exam ID prefix detection
    if (examId) {
        const id = examId.toLowerCase();
        // Azure exams: az-*, dp-*, ai-*
        if (id.startsWith('az-') || id.startsWith('dp-') || id.startsWith('ai-')) return 'azure';
        // AWS exams: clf-*, saa-*, dva-*, soa-*, dea-*, mla-*, aif-*
        if (id.startsWith('clf-') || id.startsWith('saa-') || id.startsWith('dva-') ||
            id.startsWith('soa-') || id.startsWith('dea-') || id.startsWith('mla-') ||
            id.startsWith('aif-')) return 'aws';
        // GCP exams: gcp-*
        if (id.startsWith('gcp-')) return 'gcp';
    }

    return 'azure'; // Default fallback
}

describe('getProviderFromExam', () => {
    describe('provider detection from metadata', () => {
        it('should detect Azure from metadata provider', () => {
            expect(getProviderFromExam('any-exam', 'Microsoft Azure')).toBe('azure');
            expect(getProviderFromExam('any-exam', 'Azure')).toBe('azure');
            expect(getProviderFromExam('any-exam', 'AZURE')).toBe('azure');
            expect(getProviderFromExam('any-exam', 'Microsoft')).toBe('azure');
        });

        it('should detect AWS from metadata provider', () => {
            expect(getProviderFromExam('any-exam', 'Amazon Web Services')).toBe('aws');
            expect(getProviderFromExam('any-exam', 'AWS')).toBe('aws');
            expect(getProviderFromExam('any-exam', 'aws')).toBe('aws');
            expect(getProviderFromExam('any-exam', 'Amazon')).toBe('aws');
        });

        it('should detect GCP from metadata provider', () => {
            expect(getProviderFromExam('any-exam', 'Google Cloud Platform')).toBe('gcp');
            expect(getProviderFromExam('any-exam', 'GCP')).toBe('gcp');
            expect(getProviderFromExam('any-exam', 'gcp')).toBe('gcp');
            expect(getProviderFromExam('any-exam', 'Google')).toBe('gcp');
        });

        it('should prioritize metadata over exam ID', () => {
            // GCP exam ID but Azure in metadata
            expect(getProviderFromExam('gcp-cloud-arch', 'Azure')).toBe('azure');
            // Azure exam ID but AWS in metadata
            expect(getProviderFromExam('az-900', 'AWS')).toBe('aws');
        });
    });

    describe('provider detection from exam ID', () => {
        describe('Azure exam IDs', () => {
            it('should detect AZ-* exams as Azure', () => {
                expect(getProviderFromExam('az-900', null)).toBe('azure');
                expect(getProviderFromExam('az-104', null)).toBe('azure');
                expect(getProviderFromExam('az-400', null)).toBe('azure');
                expect(getProviderFromExam('AZ-500', null)).toBe('azure');
            });

            it('should detect DP-* exams as Azure', () => {
                expect(getProviderFromExam('dp-100', null)).toBe('azure');
                expect(getProviderFromExam('dp-203', null)).toBe('azure');
                expect(getProviderFromExam('DP-900', null)).toBe('azure');
            });

            it('should detect AI-* exams as Azure', () => {
                expect(getProviderFromExam('ai-900', null)).toBe('azure');
                expect(getProviderFromExam('ai-102', null)).toBe('azure');
                expect(getProviderFromExam('AI-900', null)).toBe('azure');
            });
        });

        describe('AWS exam IDs', () => {
            it('should detect CLF-* exams as AWS', () => {
                expect(getProviderFromExam('clf-c01', null)).toBe('aws');
                expect(getProviderFromExam('clf-c02', null)).toBe('aws');
                expect(getProviderFromExam('CLF-C02', null)).toBe('aws');
            });

            it('should detect SAA-* exams as AWS', () => {
                expect(getProviderFromExam('saa-c03', null)).toBe('aws');
                expect(getProviderFromExam('SAA-C03', null)).toBe('aws');
            });

            it('should detect DVA-* exams as AWS', () => {
                expect(getProviderFromExam('dva-c02', null)).toBe('aws');
                expect(getProviderFromExam('DVA-C02', null)).toBe('aws');
            });

            it('should detect SOA-* exams as AWS', () => {
                expect(getProviderFromExam('soa-c02', null)).toBe('aws');
                expect(getProviderFromExam('SOA-C02', null)).toBe('aws');
            });

            it('should detect DEA-* exams as AWS', () => {
                expect(getProviderFromExam('dea-c01', null)).toBe('aws');
                expect(getProviderFromExam('DEA-C01', null)).toBe('aws');
            });

            it('should detect MLA-* exams as AWS', () => {
                expect(getProviderFromExam('mla-c01', null)).toBe('aws');
                expect(getProviderFromExam('MLA-C01', null)).toBe('aws');
            });

            it('should detect AIF-* exams as AWS', () => {
                expect(getProviderFromExam('aif-c01', null)).toBe('aws');
                expect(getProviderFromExam('AIF-C01', null)).toBe('aws');
            });
        });

        describe('GCP exam IDs', () => {
            it('should detect GCP-* exams as GCP', () => {
                expect(getProviderFromExam('gcp-fund-core', null)).toBe('gcp');
                expect(getProviderFromExam('gcp-cloud-arch', null)).toBe('gcp');
                expect(getProviderFromExam('gcp-cloud-eng', null)).toBe('gcp');
                expect(getProviderFromExam('gcp-networks', null)).toBe('gcp');
                expect(getProviderFromExam('GCP-DATA-ENG-ML', null)).toBe('gcp');
            });
        });
    });

    describe('fallback behavior', () => {
        it('should return azure as default for unknown exam IDs', () => {
            expect(getProviderFromExam('unknown-exam', null)).toBe('azure');
            expect(getProviderFromExam('random-123', null)).toBe('azure');
        });

        it('should return azure when both examId and provider are null', () => {
            expect(getProviderFromExam(null, null)).toBe('azure');
        });

        it('should return azure when examId is null and provider is unrecognized', () => {
            expect(getProviderFromExam(null, 'Unknown Provider')).toBe('azure');
        });

        it('should handle empty strings', () => {
            expect(getProviderFromExam('', '')).toBe('azure');
            expect(getProviderFromExam('', null)).toBe('azure');
        });
    });

    describe('case insensitivity', () => {
        it('should handle mixed case exam IDs', () => {
            expect(getProviderFromExam('Az-900', null)).toBe('azure');
            expect(getProviderFromExam('Clf-C02', null)).toBe('aws');
            expect(getProviderFromExam('Gcp-Fund-Core', null)).toBe('gcp');
        });

        it('should handle mixed case provider strings', () => {
            expect(getProviderFromExam('test', 'MICROSOFT AZURE')).toBe('azure');
            expect(getProviderFromExam('test', 'Amazon Web Services')).toBe('aws');
            expect(getProviderFromExam('test', 'GOOGLE cloud platform')).toBe('gcp');
        });
    });
});

describe('Percentage calculations', () => {
    // Test the percentage calculation logic used in updateScoreDisplay and exportResults

    const calculatePercentComplete = (attempted, total) => {
        return total > 0 ? Math.round((attempted / total) * 100) : 0;
    };

    const calculatePercentSuccess = (score, attempted) => {
        return attempted > 0 ? Math.round((score / attempted) * 100) : 0;
    };

    describe('calculatePercentComplete', () => {
        it('should calculate completion percentage correctly', () => {
            expect(calculatePercentComplete(5, 10)).toBe(50);
            expect(calculatePercentComplete(10, 10)).toBe(100);
            expect(calculatePercentComplete(0, 10)).toBe(0);
            expect(calculatePercentComplete(3, 10)).toBe(30);
        });

        it('should handle zero total questions', () => {
            expect(calculatePercentComplete(0, 0)).toBe(0);
            expect(calculatePercentComplete(5, 0)).toBe(0);
        });

        it('should round to nearest integer', () => {
            expect(calculatePercentComplete(1, 3)).toBe(33);
            expect(calculatePercentComplete(2, 3)).toBe(67);
        });
    });

    describe('calculatePercentSuccess', () => {
        it('should calculate success percentage correctly', () => {
            expect(calculatePercentSuccess(8, 10)).toBe(80);
            expect(calculatePercentSuccess(10, 10)).toBe(100);
            expect(calculatePercentSuccess(0, 10)).toBe(0);
        });

        it('should handle zero attempts', () => {
            expect(calculatePercentSuccess(0, 0)).toBe(0);
        });

        it('should round to nearest integer', () => {
            expect(calculatePercentSuccess(1, 3)).toBe(33);
            expect(calculatePercentSuccess(2, 3)).toBe(67);
        });
    });
});
