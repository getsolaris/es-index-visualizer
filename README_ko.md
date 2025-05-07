# Elasticsearch Index Visualizer

[English](README.md)
[Korean](README_ko.md)

시각적으로 Elasticsearch 인덱스 구조를 설계하고 확인할 수 있는 도구입니다. 

<img src="https://raw.githubusercontent.com/getsolaris/es-index-visualizer/refs/heads/main/images/1.png">

## 기능
- 인덱스 구조 시각화
- 샤드 구조 시각화
    - <img src="https://raw.githubusercontent.com/getsolaris/es-index-visualizer/refs/heads/main/images/2.png" width="200px">
- Tokenizer, Analyzer 시각화
- 분석기 시뮬레이션
    - <img src="https://raw.githubusercontent.com/getsolaris/es-index-visualizer/refs/heads/main/images/3.png"  width="200px">
- 시각화 섹션 캡처 기능

## 타입 지원
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

## 설치
```bash
$ npm install
$ npm run dev
```