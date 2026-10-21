import UIKit

extension UIView {
  var duoParentViewController: UIViewController? {
    var responder: UIResponder? = next
    while let current = responder {
      if let controller = current as? UIViewController { return controller }
      responder = current.next
    }
    return nil
  }

  func duoEmbed(_ child: UIViewController) {
    guard window != nil, child.parent == nil, let parent = duoParentViewController else { return }
    parent.addChild(child)
    child.view.frame = bounds
    addSubview(child.view)
    child.didMove(toParent: parent)
    if #available(iOS 27.1, *) {
      parent.setNeedsUpdateOfVerticalBarConfiguration()
    }
  }
}

final class DuoHostedController: UIViewController {
  private weak var hosted: UIView?

  init(hosting view: UIView) {
    hosted = view
    super.init(nibName: nil, bundle: nil)
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) { fatalError() }

  override func loadView() {
    view = hosted ?? UIView()
  }

  @available(iOS 27.1, *)
  override var childForPreferredVerticalBarBehavior: UIViewController? {
    children.last
  }
}
