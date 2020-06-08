---
name: Rain 2D
languages:
  - C#
year: 2018
technologies:
  - Direct2D
  - WPF
links:
  github: https://github.com/laptou/rain-2d
---
Rain 2D is an SVG graphics editor that I worked on for nearly a year, starting
in the summer of 2018. I was frustrated with the vector graphics software I had
at my disposal, as I looked jealously at Adobe Illustrator, but of course, I
absolutely refuse to subscribe to Adobe CC because I hate this model of
subscription software. Adobe isn't providing any continuous service with their
software except their cloud (which I do not want), so I refuse to give them
continuous payments.

It can't be *that* hard, I thought to myself as I embarked on this project. By
the end, I learned many things about graphics, linear algebra, the SVG spec, and
scope creep - but I did *not* end up with an Illustrator killer. However, I did
end up with a bespoke SVG renderer sophisticated enough to render the
Ghostscript Tiger.

Rain 2D is an MVVM WPF application with a Direct2D renderer written using
SharpDX. I tried to use [Rx.NET](https://github.com/dotnet/reactive) to handle
my rendering pipeline, with the idea being that frames would be rendered only
when changes occurred, and Rx.NET would help me aggregate and filter these
changes. It worked, but it was horribly slow: rendering the GhostScript Tiger
takes at least 300ms per frame.
