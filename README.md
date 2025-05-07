# Elasticsearch Index Visualizer

[English](README.md)
[Korean](README_ko.md)


A tool for visually designing and inspecting Elasticsearch index structures.

<img src="https://raw.githubusercontent.com/getsolaris/es-index-visualizer/refs/heads/main/images/1.png">

## 기능
- Visualize index mappings
- Visualize shard distribution
    - <img src="https://raw.githubusercontent.com/getsolaris/es-index-visualizer/refs/heads/main/images/2.png"  width="200px">
- Visualize tokenizers and analyzers
- Analyzer Simulation
    - <img src="https://raw.githubusercontent.com/getsolaris/es-index-visualizer/refs/heads/main/images/3.png"  width="200px">
- Capture visualized sections as images

## Supported Field Types
- text
- keyword
- integer
- long
- short
- byte
- double
- float
- date
- boolean
- object
- nested
- join

## Installation
```bash
$ npm install
$ npm run dev
```