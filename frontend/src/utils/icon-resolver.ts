import type { Component } from 'vue';

type IconResolver = (name: string) => Component | null;

let customResolver: IconResolver | null = null;

export function setIconResolver(resolver: IconResolver) {
  customResolver = resolver;
}

export function resolveIcon(name: string): Component | null {
  if (customResolver) {
    return customResolver(name);
  }
  return null;
}
