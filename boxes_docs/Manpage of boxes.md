Title: Manpage of boxes(1)

URL Source: https://boxes.thomasjensen.com/boxes-man-1.html

Markdown Content:
_Boxes_ Version:

Section: User Commands (1)

Updated: October 3 2024

NAME[](https://boxes.thomasjensen.com/boxes-man-1.html#NAME)
------------------------------------------------------------

boxes - text mode box and comment drawing filter

SYNOPSIS[](https://boxes.thomasjensen.com/boxes-man-1.html#SYNOPSIS)
--------------------------------------------------------------------

**boxes** [options] [infile [outfile]]

DESCRIPTION[](https://boxes.thomasjensen.com/boxes-man-1.html#DESCRIPTION)
--------------------------------------------------------------------------

_Boxes_ is a text filter which can draw any kind of box around its input text. Box design choices range from simple boxes to complex ASCII art. A box can also be removed and repaired, even if it has been badly damaged by editing of the text inside. Since boxes may be open on any side, _boxes_ can also be used to create regional comments in any programming language. New box designs can be added and shared by appending to a configuration file.

_boxes_ is a command line tool, but also integrates with any text editor that supports filters. The _boxes_ website has examples on how to configure editor integration for various text editors: 

[https://boxes.thomasjensen.com/editors.html](https://boxes.thomasjensen.com/editors.html)

OPTIONS[](https://boxes.thomasjensen.com/boxes-man-1.html#OPTIONS)
------------------------------------------------------------------

Options offered by _boxes_ are the following:

[**-a**_format_](https://boxes.thomasjensen.com/boxes-man-1.html), **--align**=_format_

Alignment/positioning of text inside box. This option takes a format string argument which is read from left to right. The format string may not contain whitespace and must consist of one or more of the following components:

*   **h**_x_ - horizontal alignment of the input text block inside a box.

 Possible values for _x_ are `l` (ell, for left alignment), `c` (center), or `r` (right). This does not affect the justification of text lines within the input text block (use the **j**argument instead).
*   **v**_x_ - vertical alignment of the input text block inside a box.

 Possible values for _x_ are `t` (for top alignment), `c` (center), or `b` (bottom).
*   **j**_x_ - justification of lines within the input text block.

 Possible values for _x_ are `l` (ell, for left justification), `c` (center), or `r` (right). This does not affect the alignment of the input text block itself within the box. Use the **h** and **v** arguments for input text block positioning.

Short hand notations (can be combined with the above arguments):

*   `l` (ell) - short for `hlvcjl`
*   `c` - short for `hcvcjc`
*   `r` - short for `hrvcjr`

The default for `-a` is `hlvt`.

[**-c**_string_](https://boxes.thomasjensen.com/boxes-man-1.html), **--create**=_string_

Command line design definition for simple cases. The argument of this option is the definition for the "west" (W) shape. The defined shape must consist of exactly one line, i.e. no multi-line shapes are allowed. The **-c** option is intended as a shortcut for those cases where simple regional comments are to be created, which only need a certain character or sequence of characters to be placed in front of every line. In such cases, it is much more convenient to simply specify **-c** than to do a complete design definition in one’s config file, where the only shape defined is the west shape. 

 This option implies a **-d** and does not access the config file. **-c** may of course be used in conjunction with any of the other options. By default, **-c** is not specified.

[**--color**](https://boxes.thomasjensen.com/boxes-man-1.html), [**--no-color**](https://boxes.thomasjensen.com/boxes-man-1.html)

Printing of color codes. Box designs and the text inside a box may contain ANSI color codes, sometimes called "escape sequences". In this way, boxes and text can be colored. 

 Whether these escape sequences are printed by _boxes_ is normally determined by the terminal capabilities (default). Using **--color**, _boxes_ can be told to always output escape sequences even if it thinks the terminal may not understand them. Using **--no-color**, escape sequences will never be printed.

Of course, even with **--color**, a box will only appear colored if it is already defined with colors. In case you want to auto-color some text that isn’t yet, take a look at _lolcat_. 

 These options consider all escape sequences to be color codes. Any other escape sequences present will be printed or removed along with the color codes.

[**-d**_string_](https://boxes.thomasjensen.com/boxes-man-1.html), **--design**=_string_

Design selection. The one argument of this option is the name of the design to use, which may either be a design’s primary name or any of its alias names.

[**-e**_eol_](https://boxes.thomasjensen.com/boxes-man-1.html), **--eol**=_eol_

Override line terminator. _eol_ can be `CR`, `LF`, or `CRLF`. The default is to use the system-specific line terminator, which means `CRLF` on Windows, and `LF` otherwise. This option should only be used in an emergency, because normally the system-specific line terminator will be just fine. This option is considered experimental, and may go away in a future version of _boxes_. Let us know in [https://github.com/ascii-boxes/boxes/issues/60](https://github.com/ascii-boxes/boxes/issues/60) if you think we should keep it.

[**-f**_string_](https://boxes.thomasjensen.com/boxes-man-1.html), **--config**=_string_

Use alternate config file. The one argument of this option is the name of a valid _boxes_ config file. The argument of **-f** can also be a directory which contains a configuration file. More information on this topic below in the CONFIGURATION FILE section.

[**-h**](https://boxes.thomasjensen.com/boxes-man-1.html), **--help**

Print usage information.

[**-i**_string_](https://boxes.thomasjensen.com/boxes-man-1.html), **--indent**=_string_

Indentation mode. Possible values for _string_ are:

*   `text` - indent text inside of box
*   `box` - indent box, not text inside of box
*   `none` - discard indentation

Arguments may be abbreviated. The default is `box`.

[**-k**_bool_](https://boxes.thomasjensen.com/boxes-man-1.html), **--kill-blank**, **--no-kill-blank**

Kill leading/trailing blank lines on removal. The value of _bool_ is either _true_ or _false_. This option only takes effect in connection with **-r**. If set to _true_, leading and trailing blank lines will be removed from the output. If set to _false_, the entire content of the former box is returned. The default is _false_, if both the top and the bottom part of the box are open, as is the case with most regional comments. If the box’s design defines a top part or a bottom part, the default is _true_.

[**-l**](https://boxes.thomasjensen.com/boxes-man-1.html), **--list**

List designs. Produces a listing of all available box designs in the config file, along with a sample box and information about its creator. Also checks the syntax of the entire config file. If used in conjunction with **-d**, displays detailed information about the specified design.

[**-m**,](https://boxes.thomasjensen.com/boxes-man-1.html)**--mend**

Mend box. This removes a (potentially broken) box as with **-r**, and redraws it afterwards. The mended box is drawn according to the options given. This may be important to know when it comes to restoring padding, indentation, etc. for the mended box. Implies **-k**_false_.

[**-n**_encoding_](https://boxes.thomasjensen.com/boxes-man-1.html), **--encoding**=_encoding_

Character encoding. Overrides the character encoding of the input and output text. Choose from the list shown by _iconv -l_. If an invalid character encoding is specified here, _UTF-8_ is used as a fallback. The default is to use the system encoding, which is normally the best course of action. So don’t specify this option unless you have to.

[**-p**_string_](https://boxes.thomasjensen.com/boxes-man-1.html), **--padding**=_string_

Padding. Specify padding in spaces around the input text block for all sides of the box. The argument string may not contain whitespace and must consist of a combination of the following characters, each followed by a number indicating the padding in spaces:

*   `a` - (all) give padding for all sides at once
*   `h` - (horiz) give padding for both horizontal sides
*   `v` - (vertical) give padding for both vertical sides
*   `b` - (bottom) give padding for bottom (south) side
*   `l` - (left) give padding for left (west) side
*   `t` - (top) give padding for top (north) side
*   `r` - (right) give padding for right (east) side

Example: `-p a4t2` would define the padding to be 4 characters on all sides, except for the top of the box, where the input text block will be only 2 lines away from the box. 

 The default for this option is determined by the box design used. If the design does not specify anything, no default padding is used.

[**-q**_query_](https://boxes.thomasjensen.com/boxes-man-1.html), **--tag-query**=_query_

Query designs by tag. In contrast to **-l**, this will only print the matching design names. This option is normally used stand-alone; if used in combination with other options, behavior is undefined. The _query_ argument is a comma-separated list of tags which can be present on a design in order to match. A tag may optionally be prefixed with `+` in order to require that it be present, or with `-` in order to exclude designs which have that tag. Each tag can only occur once per query. The special query _(all)_ matches all box designs, even if they don't have any tags. 

 This option is intended for use by scripts. Alias names are printed below their primary design name, and postfixed with `(alias)`. 

 Example: `boxes -q programming,-comment`

[**-r**](https://boxes.thomasjensen.com/boxes-man-1.html), **--remove**

Remove an existing box. Which design to use is detected automatically. In order to save time or in case the detection does not decide correctly, combine with **-d** to specify the design.

[**-s**_width_**x**_height_](https://boxes.thomasjensen.com/boxes-man-1.html), **--size**=_width_**x**_height_

Box size. This option specifies the desired box size in units of columns (for width) and lines (for height). If only a single number is given as argument, this number specifies the desired box width. A single number prefixed by `x` specifies only the box height. The actual resulting box size may vary depending on the individual shape sizes of the chosen design. Also, other command line options may influence the box size (such as **-p**). 

 By default, the smallest possible box is created around the text.

[**-t**_tabopts_](https://boxes.thomasjensen.com/boxes-man-1.html), **--tabs**=_tabopts_

Tab handling. This option controls how tab characters in the input text are handled. The _tabopts_ must always begin with a positive integer number indicating the distance between tab stops, sometimes called "spaces per tab". 

 Immediately following the tab distance, an optional character can be appended, telling _boxes_ how to treat the leading tabs. The following options are available:

*   `e` - expand tabs into spaces
*   `k` - keep tabs as close to what they were as possible
*   `u` - unexpand tabs. This makes _boxes_ turn as many spaces as possible into tabs.

The **-t**_string_ can be just a number. In that case, **e** is assumed for tab handling. The default for the **-t** option is simply `8`, which is just such a case. 

 For example, you could specify `-t 4u` in order to have your leading tabs unexpanded. In the box content, tabs are always converted into spaces. The tab distance in this example is 4.

[**-v**](https://boxes.thomasjensen.com/boxes-man-1.html), **--version**

Print out current version number.

CONFIGURATION FILE[](https://boxes.thomasjensen.com/boxes-man-1.html#CONFIGURATION%20FILE)
------------------------------------------------------------------------------------------

_Boxes_ will look for the configuration file in several places, some of which are given by the XDG specification.

1.   **-f** option [file or dir]

When a configuration file is specified on the command line, we will use that. The **-f** option can also specify a directory. Any location specified via **-f** must exist, or _boxes_ will terminate with an error.
2.   _BOXES_ environment variable [file or dir]

 If no config file is specified on the command line, _boxes_ will check for the BOXES environment variable, which may contain a filename or directory to use. Any location specified via the BOXES environment variable must exist, or _boxes_ will terminate with an error.
3.   _$HOME_ [dir]
4.   _$XDG\_CONFIG\_HOME/boxes_ [dir]
5.   _$HOME/.config/boxes_ [dir]
6.   _/usr/share/boxes_ [file]
7.   _/etc/xdg/boxes_ [dir]
8.   _/usr/local/share/boxes_ [dir]
9.   _/usr/share/boxes_ [dir]

Either one of these last two directory locations might have the same name as the global config file from **6**. That’s fine. It just means that we first look for a file of that name, and then for a directory containing the file.

The XDG environment variable _XDG\_CONFIG\_DIRS_ is not supported. However, its default value is supported via steps **8** and **9** above. 

 In the above list, whenever a step is designated with [dir], the following file names will be found, in this order:

1.   `.boxes`
2.   `box-designs`
3.   `boxes-config`
4.   `boxes`

As soon as the first valid file is found, we use that and stop the search.

The recommended location for a user-specific configuration file is _$HOME/.boxes_ or _$HOME/.config/boxes/.boxes_. A global configuration file should be located at _/usr/share/boxes_. But all of the other locations are fully supported, too.

The syntax of _boxes_ config files is described on the website at [https://boxes.thomasjensen.com/config-syntax.html](https://boxes.thomasjensen.com/config-syntax.html).

EXAMPLES[](https://boxes.thomasjensen.com/boxes-man-1.html#EXAMPLES)
--------------------------------------------------------------------

Examples on how to invoke _boxes_ may be found on the website at [https://boxes.thomasjensen.com/examples.html](https://boxes.thomasjensen.com/examples.html). 

 Try

`echo "Good Bye World!" | boxes -d nuke`
_Boxes_ also combines nicely with other tools. Try

`figlet "boxes . . . !" | lolcat -f | boxes -d unicornthink`
AVAILABILITY[](https://boxes.thomasjensen.com/boxes-man-1.html#AVAILABILITY)
----------------------------------------------------------------------------

The _boxes_ website is [https://boxes.thomasjensen.com/](https://boxes.thomasjensen.com/). It contains a number of examples illustrating this manual page as well as more in-depth documentation.

_Boxes_ was made by Thomas Jensen and the _boxes_ contributors. It has been lovingly maintained since 1999. 

 For a full list of contributors, see [https://boxes.thomasjensen.com/team.html#contributors](https://boxes.thomasjensen.com/team.html#contributors) and [https://github.com/ascii-boxes/boxes/graphs/contributors](https://github.com/ascii-boxes/boxes/graphs/contributors). 

 Please refer to the _boxes_ website for the maintainer’s current email address.

VERSION[](https://boxes.thomasjensen.com/boxes-man-1.html#VERSION)
------------------------------------------------------------------

This is _boxes_ version 2.3.1.

LICENSE[](https://boxes.thomasjensen.com/boxes-man-1.html#LICENSE)
------------------------------------------------------------------

_boxes_ is free software under the terms of the GNU General Public License, version 3. Details in the LICENSE file: [https://raw.githubusercontent.com/ascii-boxes/boxes/v2.3.1/LICENSE](https://raw.githubusercontent.com/ascii-boxes/boxes/v2.3.1/LICENSE)

ENVIRONMENT[](https://boxes.thomasjensen.com/boxes-man-1.html#ENVIRONMENT)
--------------------------------------------------------------------------

_Boxes_ recognizes the following environment variables:

BOXES Absolute path of the _boxes_ configuration file. If this is specified, it must refer to an existing file or directory.HOME The user's home directory.XDG_CONFIG_HOME The root of the configuration file location as per the XDG specification.
SEE ALSO[](https://boxes.thomasjensen.com/boxes-man-1.html#SEE%20ALSO)
----------------------------------------------------------------------

**figlet**(6), **iconv**(1), **lolcat**(6)

Page created: April 6, 1999 Last updated: October 3, 2024