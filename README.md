# Simple indication of workspace

The extension is inspired by [Simply Workspaces](https://github.com/andyrichardson/simply-workspaces). Unlike the mentioned extension, the code has become readable and will be clear even to a beginner. 

- Indicator with an i3/polybar style
- Similar to polybar, workspaces that have no windows will be hidden
- Works with dynamic workspaces

> But to be fair, this is my first time developing gnome extensions, I've been consumed by dozens of [documentation](https://gjs-docs.gnome.org) tabs, as a bonus there's also [repository](https://github.com/Gr3q/types-gjs)  which can be imported into WebStorm as a library

![Screenshot](https://user-images.githubusercontent.com/12779610/169256960-b7b5209f-0896-4be7-9338-594a9092bf11.png)

## Installation

The easiest way to get started is by getting this from the [Gnome Extensions site](https://extensions.gnome.org/extension/5081/simple-indication-of-workspaces).

### Manual installation

System installation

```sh
git clone https://github.com/azate/simple-indication-of-workspaces.git
cd simple-indication-of-workspaces
make install
```

User installation (and/or dev)

```sh
git clone https://github.com/azate/simple-indication-of-workspaces.git \
    ~/.local/share/gnome-shell/extensions/this.simple-indication-of-workspaces@azate.email
```

## Usage

Make sure you're using static workspaces **(required for further instructions)**

```sh
dconf write /org/gnome/mutter/dynamic-workspaces false
```

### Suggested setup

Here's some quick tips for getting an i3-like experience in Gnome.

#### Workspace count

Configure Gnome to use 10 static workspaces.

```sh
dconf write /org/gnome/desktop/wm/preferences/num-workspaces 10
```

#### Keyboard shortcuts

Set up `Super+Num` keyboard shortcut to switch between workspaces.

```sh
for i in {1..10}
do
   dconf write /org/gnome/desktop/wm/keybindings/switch-to-workspace-$i "['<Super>$i']"
   dconf write /org/gnome/shell/keybindings/switch-to-application-$i "@as []"
done
dconf write /org/gnome/desktop/wm/keybindings/switch-to-workspace-10 "['<Super>0']"
```

Set up `Super+Shift+Num` keyboard shortcut to move windows between workspaces.

```sh
for i in {1..10}
do
   dconf write /org/gnome/desktop/wm/keybindings/move-to-workspace-$i "['<Super><Shift>$i']"
done
dconf write /org/gnome/desktop/wm/keybindings/move-to-workspace-10 "['<Super><Shift>0']"
```
