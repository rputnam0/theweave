import React from 'react';

const BLOCK_ELEMENTS = new Set([
  'div',
  'section',
  'article',
  'main',
  'aside',
  'header',
  'footer',
  'p',
  'pre',
]);

const HEADING_ELEMENTS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

const INLINE_DECORATORS = new Set(['strong', 'b', 'em', 'i', 'code']);

const normalizeNewlines = (text: string) =>
  text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const wrapBlock = (text: string) => {
  if (!text.trim()) return '';
  return `\n${text}\n`;
};

const serializeChildren = (children: React.ReactNode[]) =>
  children.map((child) => serializeContent(child)).join('');

export const serializeContent = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return serializeChildren(node);

  if (React.isValidElement(node)) {
    const type = node.type;
    const children = React.Children.toArray(node.props?.children || []);
    const text = serializeChildren(children);

    if (typeof type === 'string') {
      if (type === 'br') return '\n';
      if (type === 'hr') return '\n---\n';
      if (type === 'li') return `- ${text}\n`;
      if (type === 'ul' || type === 'ol') return wrapBlock(text);
      if (HEADING_ELEMENTS.has(type)) return wrapBlock(text.toUpperCase());
      if (INLINE_DECORATORS.has(type)) {
        if (type === 'strong' || type === 'b') return `**${text}**`;
        if (type === 'em' || type === 'i') return `_${text}_`;
        if (type === 'code') return `\`${text}\``;
      }
      if (type === 'a') {
        const href = node.props?.href;
        if (href) return `${text} (${href})`;
        return text;
      }
      if (BLOCK_ELEMENTS.has(type)) return wrapBlock(text);
    }

    return text;
  }

  return '';
};

export const renderNodeToText = (node: React.ReactNode) => normalizeNewlines(serializeContent(node));
