# YAML i18n Manager

CLI tool for managing big projects that use https://github.com/hitchcott/gatsby-plugin-yaml-i18n

## What does it do

- Generates translations using Google Translate
- Generates CSVs for each language to manage human translations
- Helps manage updates to the structure of translations over multiple languages

## Usage

```bash
$ gpyim --help
```

## Configuration Options

```yaml
googleTranslateApiKey: 'xxx'
defaultLocale: 'en'
availableLocales:
  zh:
    googleTranslateLanguageCode: zh-CN
keyBlacklist:
  - link
  - key
  - linkRef
fileBlacklist:
  - blog/*
  - blah/something.yaml
```

## Methods

The basic flow is:

- Translate everything via google translate, create YAML files
- Create CSVs listing all the translations to be checked manually
- Override the YAML files if there is a manual version

### Generate YAML

- Define the default language ('en')
- Read all the yaml files and flatten into key/vals
- Translate each key via google translate if it doesn't exist, use YAML as source of truth
- Save the structure as YAML in correct place

### Save the CSV File

```csv
key,dHash,gHash,flag,default,existing,updated
```

Types can be: `google`, `human`

### Update from CSV

- Read the 'updated' comlumn and apply

## Scenarios

- No translation present - get google translation
- English updates a google translated item - get new google translation
- English updates a human translation - add a flag
- Content structure changes - use english hash to migrate

## TODO

- Get rid of CSV stuff; use YAML instead (with comments)
- Option for Markdown
