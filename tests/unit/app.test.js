/**
 * QuizApp Unit Tests
 * Tests for provider detection, HTML sanitization, and utility functions
 */

import { describe, it, expect } from 'vitest';
import { getProviderFromExam, sanitizeHTML } from '../../js/app.js';

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

        it('should detect Anthropic from metadata provider', () => {
            expect(getProviderFromExam('any-exam', 'Anthropic')).toBe('anthropic');
            expect(getProviderFromExam('any-exam', 'ANTHROPIC')).toBe('anthropic');
            expect(getProviderFromExam('any-exam', 'anthropic')).toBe('anthropic');
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

        describe('Anthropic exam IDs', () => {
            it('should detect CCA-* exams as Anthropic', () => {
                expect(getProviderFromExam('cca-f', null)).toBe('anthropic');
                expect(getProviderFromExam('CCA-F', null)).toBe('anthropic');
                expect(getProviderFromExam('cca-advanced', null)).toBe('anthropic');
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
            expect(getProviderFromExam('Cca-F', null)).toBe('anthropic');
        });

        it('should handle mixed case provider strings', () => {
            expect(getProviderFromExam('test', 'MICROSOFT AZURE')).toBe('azure');
            expect(getProviderFromExam('test', 'Amazon Web Services')).toBe('aws');
            expect(getProviderFromExam('test', 'GOOGLE cloud platform')).toBe('gcp');
            expect(getProviderFromExam('test', 'Anthropic')).toBe('anthropic');
        });
    });
});

describe('sanitizeHTML', () => {
    it('should strip script tags', () => {
        const result = sanitizeHTML('<script>alert("xss")</script>');
        expect(result).not.toContain('<script');
        expect(result).not.toContain('alert');
    });

    it('should strip event handler attributes', () => {
        const result = sanitizeHTML('<img onerror="alert(\'xss\')" src="x">');
        expect(result).not.toContain('onerror');
    });

    it('should pass through safe content', () => {
        const result = sanitizeHTML('<p>safe content</p>');
        expect(result).toBe('<p>safe content</p>');
    });

    it('should strip style tags', () => {
        const result = sanitizeHTML('<style>body{display:none}</style><p>ok</p>');
        expect(result).not.toContain('<style');
        expect(result).toContain('<p>ok</p>');
    });

    it('should strip iframes', () => {
        const result = sanitizeHTML('<iframe src="evil.html"></iframe>');
        expect(result).not.toContain('<iframe');
    });

    it('should strip javascript: hrefs', () => {
        const result = sanitizeHTML('<a href="javascript:alert(1)">click</a>');
        expect(result).not.toContain('javascript:');
    });

    it('should return empty string for falsy input', () => {
        expect(sanitizeHTML('')).toBe('');
        expect(sanitizeHTML(null)).toBe('');
        expect(sanitizeHTML(undefined)).toBe('');
    });

    it('should handle nested dangerous elements', () => {
        const result = sanitizeHTML('<div><script>bad</script><p>good</p></div>');
        expect(result).not.toContain('<script');
        expect(result).toContain('<p>good</p>');
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
