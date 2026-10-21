import ExpoModulesCore
import UIKit

public class YohakuDuoShellModule: Module {
  public func definition() -> ModuleDefinition {
    Name("YohakuDuoShell")

    Constants([
      "isDuo": DuoDevice.isDuo
    ])

    View(DuoTabsView.self) {
      ViewName("DuoTabs")
      Events("onTabSelect")
      Prop("selectedIndex") { (view: DuoTabsView, index: Int) in
        view.setSelectedIndex(index)
      }
      Prop("activeTintColor") { (view: DuoTabsView, color: UIColor?) in
        view.setTintColor(color)
      }
      Prop("inactiveTintColor") { (view: DuoTabsView, color: UIColor?) in
        view.setInactiveTintColor(color)
      }
    }

    View(DuoTabView.self) {
      ViewName("DuoTab")
      Prop("title") { (view: DuoTabView, title: String) in
        view.setTitle(title)
      }
      Prop("systemImage") { (view: DuoTabView, name: String?) in
        view.setSystemImage(name)
      }
      Prop("selectedSystemImage") { (view: DuoTabView, name: String?) in
        view.setSelectedSystemImage(name)
      }
      Prop("icon") { (view: DuoTabView, source: DuoImageSource?) in
        view.setIcon(source)
      }
      Prop("selectedIcon") { (view: DuoTabView, source: DuoImageSource?) in
        view.setSelectedIcon(source)
      }
      Prop("iconRenderingMode") { (view: DuoTabView, mode: String?) in
        view.setIconRenderingMode(mode ?? "template")
      }
    }

    View(DuoStackView.self) {
      ViewName("DuoStack")
      Events("onNativePop", "onTransition")
    }

    View(DuoScreenView.self) {
      ViewName("DuoScreen")
      Events("onBarItem")
      Prop("title") { (view: DuoScreenView, title: String) in
        view.setTitle(title)
      }
      Prop("barItems") { (view: DuoScreenView, items: [DuoBarItem]) in
        view.setBarItems(items)
      }
      Prop("routeKey") { (view: DuoScreenView, key: String) in
        view.routeKey = key
      }
      Prop("presentation") { (view: DuoScreenView, presentation: String?) in
        view.presentation = presentation ?? "push"
      }
      Prop("animation") { (view: DuoScreenView, animation: String?) in
        view.animation = animation ?? "default"
      }
      Prop("headerShown") { (view: DuoScreenView, shown: Bool?) in
        view.setHeaderShown(shown ?? true)
      }
      Prop("titleHidden") { (view: DuoScreenView, hidden: Bool?) in
        view.setTitleHidden(hidden ?? false)
      }
      Prop("sheetDetents") { (view: DuoScreenView, detents: [Double]?) in
        view.detents = detents ?? []
      }
      Prop("sheetGrabberVisible") { (view: DuoScreenView, visible: Bool?) in
        view.grabberVisible = visible ?? false
      }
      Prop("sheetLargestUndimmedDetentIndex") { (view: DuoScreenView, index: Int?) in
        view.largestUndimmedDetentIndex = index
      }
    }

    View(DuoReadableView.self) {
      ViewName("DuoReadable")
      Events("onPosture")
      Prop("startAngle") { (view: DuoReadableView, value: Double) in
        view.setStartAngle(value)
      }
      Prop("columnMaxWidth") { (view: DuoReadableView, value: Double) in
        view.setMaxWidth(value)
      }
    }

    View(DuoColumnView.self) {
      ViewName("DuoColumn")
    }
  }
}
