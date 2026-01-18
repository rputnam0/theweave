# Docs - Config File Syntax - boxes
The _boxes_ config file is a succession of box design definitions.

Its character encoding is UTF-8. Versions of _boxes_ prior to v2.3.0 used ASCII-encoded config files.

_Boxes_ config files are case insensitive, i.e. upper/lower case does not matter.

### Box Design[](#box-design)

```
BOX design_name
    entries_and_blocks
END design_name
```


A box design may optionally have **alias names** in addition to the primary design name (since _boxes_ v2.1.0). Alias names are appended to the primary design name as a comma-separated list. For example:

```
BOX design_name, alias1, alias2
    entries_and_blocks
END design_name
```


After the `END` statement, only the primary design name is specified. There is no practical limit to the number of alias names. Every primary design name and alias name must be unique across the entire config file, including any parent config files.

Design names and alias names can consist of the ASCII letters `a-z` (both lower- and upper-case, although lower-case is highly recommended), digits, underscores (`_`), or dashes (`-`). The first character must be a letter.

Every box design definition must have at least a `SHAPE` block, an `ELASTIC` list, and a `SAMPLE` block.

Everything following a pound sign (`#`) is considered a comment, as long as the pound sign isn’t part of a string or something.

### Sample Block[](#sample)

```
SAMPLE
    sample_image_of_box
ENDS
```


This is the box image used for the list of available designs. The reason why an image is not simply generated is that this way, the box can be shown in an environment in which it might actually be used, e.g. with some C code around (see the [boxes config file](https://github.com/ascii-boxes/boxes/blob/master/boxes-config) for many examples).

The sample itself should be indented by _4 spaces_. This is because all other samples in the config file are also indented by this value, which simply looks better on the design list.

The `ENDS` statement must stand on a line of its own, although it may be indented. Such a line cannot occur as part of the sample itself.  
The `SAMPLE` block is a required entry in every box design definition.

#### Colored Samples[](#colored-samples)

(advanced topic)

If a box design uses [colored shapes](#colored-shapes), the sample must also be colored. This may make it less easily readable in a regular text editor, which is why you are encouraged to add a comment below the sample block which shows the box without coloring. Just put `# Monochrome sample:` and the uncolored sample below (example: the box design `warning`).

Colored samples are shown also when displaying the design list, or on the [design list](https://boxes.thomasjensen.com/v2.3.1/box-designs-color.html) on the website.

### Shapes Block[](#shapes)

```
SHAPES {
    shape_name (string_list)
    shape_name (string_list)
    ...
}
```


_`shape_name`_ may be one of `nw`, `nnw`, `n`, `nne`, `ne`, `ene`, `e`, `ese`, `se`, `sse`, `s`, `ssw`, `sw`, `wsw`, `w`, or `wnw`, corresponding to the [figure shown earlier](https://boxes.thomasjensen.com/config-general.html). The `string_list` represents the shape itself, line by line. Note that all lines must have equal length. Add extra spaces if necessary. Note also that double quotes (`"`) which appear as part of a string must be escaped by a preceding backslash, so as not to terminate the string early. Consequently, all occurrences of backslashes must also be escaped by adding additional backslashes. The recommended process for creating a string is thus:

1.  Type in the string as you think it should look.
2.  Make your editor double all backslashes within the string.
3.  Escape all double quotes within the string by adding more backslashes.

In Vim, for example, this can be achieved by marking the block, and then typing:

Here are a few examples of valid entries in a `SHAPE` block:

```
ne  ("+++",
     "+ +",
     "+++")
SSE ("///", "\\\\\\")
s   ("\"")

```


The [`delimiter` statement](#delim) can be used to redefine the string delimiting character and the escape character, thus eliminating the above backslash problem. The `SHAPE` block is a required entry in every box design definition.

#### Colored Shapes[](#colored-shapes)

(advanced topic)

If you don’t mind getting technical, it is possible, with some effort, to add ANSI color codes to shapes so that the created boxes look colorful. One can even design them so that the contents of the box is colored (like in our `critical` design). These color codes do not count toward shape width.

The color codes are added as explained in this [stackoverflow post](https://stackoverflow.com/a/75985833/1005481). Just be sure to use only codes that change the text or background color, and not other codes which move the cursor or clear the screen. _Boxes_ will assume that all escape codes are for coloring.

Example:

```
ne ("This is ␛[31mRED␛[0m and ␛[94mBLUE␛[0m text.")

```


eventually gives

```
This is RED and BLUE text.

```


The “escape” character is an actual escape character (ASCII code 27 (0x1b)). Other ways of expressing this, such as `\033`, are currently not supported, because it is too likely to conflict with patterns found in ASCII art. If needed, you can copy&paste an escape character from the _boxes_ config file, e.g. from the `warning` design. Do not copy&paste escape characters from this web page, because we need to use _visible_ escape characters here, which are different code.

It is important to properly terminate the effects, for example by using `␛[0m`. Ideally, this should be done for each colored character, because that makes it easiest to copy&paste, truncate a shape line or otherwise modify it. At the very least, any coloring effects must be terminated at the end of a shape line. This aids robustness when a box gets damaged by editing or removed, in order to make sure users are not left with leaking colors. The only exception to this rule is when your box makes use of colored box content.

### Elastic List[](#elastic)

```
ELASTIC (shape_name, shape_name, ...)
```


Simply lists the shapes which are _elastic_. Elastic shapes are repeated so that the box can grow and shrink to meet its requested size. Corner shapes may not be elastic. Naturally, there must always be at least one elastic shape per box side. No two neighboring shapes may be elastic. A typical `ELASTIC` entry would look like this:

The elastic list is a required entry in every box design definition.

### Padding Block[](#padding)

```
PADDING {
    side_or_group_of_sides value
    side_or_group_of_sides value
    ...
}
```


Defines the default [padding area](about:/config-general.html#padding-area). Possible values for `side_or_group_of_sides` are `all`, `horizontal`, `vertical`, `top`, `left`, `right`, or `bottom`. A padding block may contain an arbitrary number of entries. Entries are read from top to bottom, so that later entries overwrite earlier entries. In the following example:

```
padding {
    vertical 3
    horiz 2
    left 4
}

```


the padding is set to 3 blank lines above the text, 2 spaces to the right of the text, 3 blank lines below the text, and 4 spaces to the left of the text. These values can be overridden by a different specification on the command line using the **\-p** option.

### Replace and Reverse Statements[](#regexp)

```
REPLACE "search_pattern" WITH "replacement_string"
...
REVERSE "search_pattern" TO "replacement_string"
...
```


These statements are used to perform substitutions on the text surrounded by a box. The `REPLACE` statements are executed on the input text when a box is being created. `REVERSE` statements have the same effect as `REPLACE` statements, but they are executed after a box has been removed. In the simplest case, one string is replaced with another:

```
replace "\\*/" with "*-/"
reverse "\\*-/" to "*/"

```


The `REPLACE` statement in the above example may be used to quote closing comment tags in the C programming language by inserting a dash between the asterisk and the slash. The `REVERSE` statement undoes this effect when the box is removed.

The search pattern may be a regular expression, and the replacement string may include backreferences. This gives you quite a powerful means for text modification. The following example is used to insert a space between all characters of the input text:

```
replace "(.)" with "$1 "
reverse "(.) " to "$1"

```


There may be many `REPLACE`/`REVERSE` statements in one design definition. They will be executed one after the other, starting from the top.

Note that as in all strings, backslashes must be doubled, i.e. _boxes_ “consumes one layer of backslashes”. This is why in the first example, there are two backslashes at the beginning of the search pattern, when only one would have been needed to escape the star operator.

The [`delimiter` statement](#delim) should not be used to change the string delimiting and escape character in regular expressions. While this is possible, it only affects _boxes_’ processing, not the regular expression engine’s. This will most likely cause confusion.

You may choose if the replacement is performed `once` per line or as many times as necessary to replace all occurrences of the sarch pattern (`global`). Put this indication in front of the search pattern (the default is `global`):

```
replace once "foo" with "bar"

```


We use [PCRE2](https://www.pcre.org/current/doc/html/) regular expression syntax. In order to craft the proper regular expressions, online tools such as [Regex101](https://regex101.com/) or [Regexper](https://regexper.com/) might come in handy.

### Indentation Mode[](#indent)

```
INDENT "indentmode"
```


This sets the default indentation mode for a design. Possible values for _`indentmode`_ are `"box"`, `"text"`, and `"none"`. The indent mode specifies how existing text indentation is treated.

*   `"box"`, which is the default setting, will cause the box to be indented by the same number of spaces as the text was. The text itself will not be indented within the box, though.
*   `"text"` will not indent the box, but instead retain the text indentation inside the box.
*   `"none"` will simply throw away all indentation.

For examples on all three indentation modes please refer to the [example page](about:/examples.html#indent).

### String Delimiters[](#delim)

```
DELIM[ITER] chars
```


_`chars`_ must consist of exactly two characters:

1.  the escape character (first character, one of `@~?!\`)
2.  the string delimiter (second character, one of `"~'!|`)

No quotes must be placed around those two characters. The effect is that until the end of the current design or until the next `DELIMITER` statement, all strings must be enclosed not by the usual double quotes (`"`), but instead by the character you specify. Also, the delimiter may be escaped not by the usual backslash (`\`), but instead by the escape character you specify. The escape character and the string delimiter must be different characters, of course.  
For example, consider the literal string `"""""`, which would normally be written like this:

Using a `DELIMITER` statement, this looks much simpler:

This mechanism is intended for box designs which have a lot of backslash or double quote characters in them.

### Names of Author and Designer[](#credit)

```
AUTHOR "name_of_author"
```


Simply states who the person was who coded the box design definition. This entry is used when displaying the list of designs (`boxes -l`). The value is free text, but it is good if some contact information is included, for example `John Doe <john@acme.com>`. These days, such openness with one’s email address may not suit everyone, so feel free to give less or differently formatted author information.

```
DESIGNER "name_of_designer"
```


In contrast to `author`, which tells us who created the config file entry, the `designer` keyword tells us who created the box design itself. In other words, this is the artist who originally created the ASCII artwork.

Please try to give both fields always. Especially in those cases where existing ASCII art from the internet is adapted for use with _boxes_, it is important (and good manners) to give credit to the original artist.

### Tags[](#tags)

Since _boxes_ v2.1.0:

```
TAGS ("tag1", "tag2", "tag3")
```


or, in all versions of _boxes_ (deprecated):

```
TAGS "tag1, tag2, tag3"
```


The `tags` statement applies one or more tags to the box design which can later be used to find and select the design in a tag query. A tag can only contain the lower-case letters `a-z`, digits, or a dash (`-`). It must not start with a dash, and a tag name can be anything but `none`.

At the end of the output of `boxes -l`, _boxes_ will print a summary of all tags found in the configuration, complete with counts of how often the tag was encountered.

A _tag query_ can be issued by invoking `boxes -q`. _Boxes_ will then print the names of all matching box designs. Details about tag queries can be found in the [manual page](about:/boxes-man-1.html#opt-q) for the `-q` option.

### General Entries[](#general-entries)

```
keyword "string_value"
```


In addition to the author entry, there may be any number of other entries of the above form, giving any kind of information. These entries are not used by _boxes_, though, and will simply be ignored.

* * *

Config File Inheritance[](#parent)
----------------------------------

A config file may specify one or more other config files as “parents” (since _boxes_ v2.1.0). This means that after the config file is read, _boxes_ will also read all the parent configs in order. If a design is found which we don’t know yet, it is added to the list. In other words, all box designs are “inherited” from the parents, and can be overwritten.

This mechanism works on the box design level. You can only override an entire box design, but not parts of one.

The syntax is

```
PARENT path_to_parent_config
```


The path to the parent config should be an absolute pathname specifying a config file (not a directory). Spaces are permitted in this path, and no quotes are used. The file name may contain UTF-8 characters. A parent reference can only occur outside of any box design definitions. The special keyword `:global:` is used to refer to the _boxes_ global config file.

This syntax implies that there cannot be a comment in the same line as the `parent` reference - it would be considered part of the file name. Instead, put comments in the line above.

For example, a user wants to add or change a design from the global config. So she creates a config file in ~/.boxes and places a `parent :global:` statement at the top to inherit the global config. The local / personal config file contains only the changes / additions.

* * *

Appendix A: Valid Characters[](#valid-characters)
-------------------------------------------------

(advanced topic)

This appendix summarizes which types of characters may occur in various places of the config file. This is really detail information. Refer to this only in case of problems. Normally, this is a fine section to skip.


|        |A  |ü  |SP |ESC|TAB |CR/LF|BEL|
|--------|---|---|---|---|----|-----|---|
|Shape   |✓  |✓  |✓  |✓  |(-)†|-    |-  |
|Sample  |✓  |✓  |✓  |✓  |(-)†|✓    |-  |
|Filename|✓  |✓  |✓  |-  |✓   |-    |-  |
|Key     |✓  |✓  |-  |-  |-   |-    |-  |
|Value   |✓  |✓  |✓  |-  |✓   |-    |-  |


The column `A` represents regular ASCII characters, `ü` stands for non-ASCII Unicode characters, and `BEL` represents all non-printable control characters except ESC.

_†_ For historical reasons, tabs can be used in shapes and samples, where they count as one space (but will not work as one, of course). This is deprecated behavior. In a future version of _boxes_, we will probably disallow the use of tabs altogether. We do not want tabs in shapes, but currently don’t prevent them either.

The “Shape” row shows which types of characters may occur as part of a box shape. “Sample” refers to the sample block. “Filename” means the file name given as a [PARENT config](#parent). “Key” is the key of the key/value pairs that every box design has, such as `author`. “Value” is its value as a string.

Read on in the next part: [A New Box Design Step By Step](https://boxes.thomasjensen.com/config-step.html)

Page created: April 6, 1999 Last updated: October 3, 2024